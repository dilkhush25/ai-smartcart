import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import { formatCurrencySymbol } from "@/lib/currency";

interface Order {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  };
}

export const InvoiceGenerator = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateInvoicePDF = async (order: Order) => {
    setGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let y = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("INVOICE", pageWidth / 2, y, { align: "center" });
      
      y += 15;
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text("Supermarket Management System", pageWidth / 2, y, { align: "center" });

      y += 20;

      // Invoice Details
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Invoice Details:", 20, y);
      
      y += 8;
      pdf.setFont("helvetica", "normal");
      pdf.text(`Invoice Number: #${order.id.split('-')[0].toUpperCase()}`, 20, y);
      
      y += 6;
      pdf.text(`Date: ${formatDate(order.created_at)}`, 20, y);
      
      y += 6;
      pdf.text(`Status: ${order.status.toUpperCase()}`, 20, y);

      y += 15;

      // Customer Information
      pdf.setFont("helvetica", "bold");
      pdf.text("Bill To:", 20, y);
      
      y += 8;
      pdf.setFont("helvetica", "normal");
      pdf.text(`Name: ${order.customer_name || 'Walk-in Customer'}`, 20, y);
      
      if (order.customer_email) {
        y += 6;
        pdf.text(`Email: ${order.customer_email}`, 20, y);
      }
      
      if (order.customer_phone) {
        y += 6;
        pdf.text(`Phone: ${order.customer_phone}`, 20, y);
      }

      y += 20;

      // Items Table Header
      pdf.setFont("helvetica", "bold");
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, y - 5, pageWidth - 40, 10, "F");
      
      pdf.text("Item", 25, y);
      pdf.text("Qty", 100, y);
      pdf.text("Unit Price", 125, y);
      pdf.text("Total", 165, y);

      y += 10;

      // Items
      pdf.setFont("helvetica", "normal");
      if (order.order_items) {
        order.order_items.forEach((item) => {
          pdf.text(item.products.name, 25, y);
          pdf.text(item.quantity.toString(), 100, y);
          pdf.text(`₹${item.unit_price.toFixed(2)}`, 125, y);
          pdf.text(`₹${item.total_price.toFixed(2)}`, 165, y);
          y += 8;
        });
      }

      y += 10;

      // Totals
      const totalsX = pageWidth - 80;
      pdf.setFont("helvetica", "normal");
      pdf.text("Subtotal:", totalsX - 30, y);
      pdf.text(`$${order.subtotal.toFixed(2)}`, totalsX, y, { align: "right" });
      
      y += 8;
      pdf.text("Tax:", totalsX - 30, y);
      pdf.text(`$${order.tax.toFixed(2)}`, totalsX, y, { align: "right" });
      
      y += 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Total:", totalsX - 30, y);
      pdf.text(`$${order.total.toFixed(2)}`, totalsX, y, { align: "right" });

      // Footer
      y += 30;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Thank you for your business!", pageWidth / 2, y, { align: "center" });

      // Save PDF
      pdf.save(`invoice-${order.id.split('-')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice PDF generated successfully"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Invoice Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">
                      #{order.id.split('-')[0].toUpperCase()}
                    </TableCell>
                    <TableCell>{order.customer_name || 'Walk-in Customer'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrencySymbol(order.total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Invoice #{order.id.split('-')[0].toUpperCase()}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">Customer Information</h4>
                                  <p>{order.customer_name || 'Walk-in Customer'}</p>
                                  {order.customer_email && <p>{order.customer_email}</p>}
                                  {order.customer_phone && <p>{order.customer_phone}</p>}
                                </div>
                                <div>
                                  <h4 className="font-semibold">Order Details</h4>
                                  <p>Date: {formatDate(order.created_at)}</p>
                                  <p>Status: {order.status}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Items</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead>Price</TableHead>
                                      <TableHead>Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.order_items?.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.products.name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{formatCurrencySymbol(item.unit_price)}</TableCell>
                                        <TableCell>{formatCurrencySymbol(item.total_price)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>${order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>${order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span>${order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          onClick={() => generateInvoicePDF(order)}
                          disabled={generatingPDF}
                          className="gap-1"
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No orders found. Complete some orders to generate invoices.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, CreditCard, Receipt } from '@phosphor-icons/react';
import { billsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BillDetailsDialogProps {
  bill: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePaymentStatus: (billId: string, status: string) => void;
  onDownloadPDF: (bill: any) => void;
}

export default function BillDetailsDialog({
  bill,
  open,
  onOpenChange,
  onUpdatePaymentStatus,
  onDownloadPDF,
}: BillDetailsDialogProps) {
  const [fullBill, setFullBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(bill?.paymentStatus || 'pending');

  useEffect(() => {
    if (open && bill) {
      fetchFullBillDetails();
      setPaymentStatus(bill.paymentStatus);
    }
  }, [open, bill]);

  const fetchFullBillDetails = async () => {
    try {
      setLoading(true);
      const response = await billsAPI.getById(bill._id);
      setFullBill(response);
    } catch (error) {
      console.error('Failed to fetch bill details:', error);
      toast.error('Failed to load bill details');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    try {
      await onUpdatePaymentStatus(bill._id, newStatus);
      setPaymentStatus(newStatus);
      toast.success('Payment status updated successfully');
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Bill Details - {bill.billNumber}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading bill details...</p>
            </div>
          </div>
        ) : fullBill ? (
          <div className="space-y-6">
            {/* Bill Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Bill Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bill Number:</span>
                    <span className="font-medium">{fullBill.billNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(new Date(fullBill.billDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={fullBill.status === 'paid' ? 'default' : 'outline'}>
                      {fullBill.status.charAt(0).toUpperCase() + fullBill.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{fullBill.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{fullBill.customer.phone}</span>
                  </div>
                  {fullBill.customer.email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{fullBill.customer.email}</span>
                    </div>
                  )}
                  {fullBill.customer.gstNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST Number:</span>
                      <span>{fullBill.customer.gstNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="min-w-[80px]">HSN</TableHead>
                      <TableHead className="min-w-[60px]">Purity</TableHead>
                      <TableHead className="min-w-[80px]">Weight (g)</TableHead>
                      <TableHead className="min-w-[60px]">Qty</TableHead>
                      <TableHead className="min-w-[100px]">Rate</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[100px]">Making Charges</TableHead>
                      <TableHead className="min-w-[80px]">CGST</TableHead>
                      <TableHead className="min-w-[80px]">SGST</TableHead>
                      <TableHead className="min-w-[100px] text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fullBill.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="min-w-[200px]">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            {item.huid && (
                              <p className="text-xs text-muted-foreground">
                                HUID: {item.huid}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[80px]">{item.hsnCode}</TableCell>
                        <TableCell className="min-w-[60px]">
                          {item.purity ? `${item.purity}K` : '-'}
                        </TableCell>
                        <TableCell className="min-w-[80px]">
                          {item.weight ? `${item.weight}g` : '-'}
                        </TableCell>
                        <TableCell className="min-w-[60px]">{item.quantity} {item.unit}</TableCell>
                        <TableCell className="min-w-[100px]">₹{item.rate.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="min-w-[100px]">₹{item.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="min-w-[100px]">
                          ₹{(item.makingCharges || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="min-w-[80px]">₹{item.cgstAmount.toFixed(2)}</TableCell>
                        <TableCell className="min-w-[80px]">₹{item.sgstAmount.toFixed(2)}</TableCell>
                        <TableCell className="min-w-[100px] text-right font-medium">
                          ₹{(item.amount + (item.makingCharges || 0) + item.cgstAmount + item.sgstAmount + (item.igstAmount || 0)).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={paymentStatus === 'paid' ? 'default' : 'destructive'}>
                        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                      </Badge>
                      <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="capitalize">{fullBill.paymentMethod || 'cash'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Amount Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{fullBill.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CGST:</span>
                    <span>₹{fullBill.totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SGST:</span>
                    <span>₹{fullBill.totalSgst.toFixed(2)}</span>
                  </div>
                  {fullBill.totalIgst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IGST:</span>
                      <span>₹{fullBill.totalIgst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tax:</span>
                    <span>₹{fullBill.totalTax.toFixed(2)}</span>
                  </div>
                  {fullBill.roundOffAmount !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Round Off:</span>
                      <span>₹{fullBill.roundOffAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Grand Total:</span>
                    <span>₹{fullBill.finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {fullBill.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{fullBill.notes}</p>
                </div>
              </>
            )}

            {/* Terms and Conditions */}
            {fullBill.termsAndConditions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-muted-foreground">{fullBill.termsAndConditions}</p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button 
                onClick={() => onDownloadPDF(fullBill)} 
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load bill details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
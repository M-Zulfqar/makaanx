"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  ArrowUpRight,
  Wallet,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const payments = [
  {
    id: 1,
    type: "Rent",
    property: "Modern Apartment in DHA Phase 5",
    amount: 85000,
    dueDate: "Apr 15, 2026",
    status: "pending",
    invoiceId: "INV-2026-001",
  },
  {
    id: 2,
    type: "Utilities",
    property: "Modern Apartment in DHA Phase 5",
    amount: 5200,
    dueDate: "Apr 20, 2026",
    status: "pending",
    invoiceId: "INV-2026-002",
  },
  {
    id: 3,
    type: "Rent",
    property: "Modern Apartment in DHA Phase 5",
    amount: 85000,
    dueDate: "Mar 15, 2026",
    status: "paid",
    paidDate: "Mar 14, 2026",
    invoiceId: "INV-2026-003",
  },
  {
    id: 4,
    type: "Security Deposit",
    property: "Modern Apartment in DHA Phase 5",
    amount: 170000,
    dueDate: "Feb 01, 2026",
    status: "paid",
    paidDate: "Feb 01, 2026",
    invoiceId: "INV-2026-004",
  },
];

const paymentMethods = [
  { id: "card", icon: CreditCard, label: "Credit/Debit Card", description: "Visa, Mastercard, etc." },
  { id: "bank", icon: Building2, label: "Bank Transfer", description: "Direct bank transfer" },
  { id: "wallet", icon: Wallet, label: "Digital Wallet", description: "JazzCash, Easypaisa" },
  { id: "cash", icon: Banknote, label: "Cash Payment", description: "Pay at branch" },
];

export default function PaymentsPage() {
  const { t, isRtl } = useI18n();
  const [selectedPayment, setSelectedPayment] = useState<typeof payments[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof payments[0] | null>(null);

  const handlePay = () => {
    if (!paymentMethod) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast.success("Payment successful!");
    }, 2000);
  };

  const totalDue = payments
    .filter((p) => p.status === "pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold text-foreground",
          isRtl && "font-urdu text-right"
        )}>
          Payments
        </h1>
        <p className="text-muted-foreground">
          Manage your rent payments and view transaction history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  Rs {totalDue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-foreground">
                  Rs {totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="text-lg font-bold text-foreground">
                  **** 4532
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Pending Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments
            .filter((p) => p.status === "pending")
            .map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-xl gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{payment.type}</p>
                    <p className="text-sm text-muted-foreground">{payment.property}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {payment.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      Rs {payment.amount.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="text-warning border-warning">
                      Pending
                    </Badge>
                  </div>
                  <Button onClick={() => setSelectedPayment(payment)}>
                    Pay Now
                  </Button>
                </div>
              </motion.div>
            ))}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments
            .filter((p) => p.status === "paid")
            .map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-xl gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{payment.type}</p>
                    <p className="text-sm text-muted-foreground">{payment.property}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Paid: {payment.paidDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">
                      Rs {payment.amount.toLocaleString()}
                    </p>
                    <Badge className="bg-success/10 text-success">
                      Paid
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      setSelectedInvoice(payment);
                      setShowInvoice(true);
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Invoice
                  </Button>
                </div>
              </motion.div>
            ))}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => {
        setSelectedPayment(null);
        setPaymentMethod(null);
        setPaymentSuccess(false);
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? "Payment Successful!" : "Make Payment"}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {paymentSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="h-10 w-10 text-success-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Payment Successful!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Rs {selectedPayment?.amount.toLocaleString()} has been paid
                </p>
                <Button onClick={() => {
                  setSelectedPayment(null);
                  setPaymentMethod(null);
                  setPaymentSuccess(false);
                }}>
                  Done
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Payment Summary */}
                <div className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{selectedPayment?.type}</span>
                    <span className="font-bold text-foreground">
                      Rs {selectedPayment?.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment?.property}
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="font-medium text-foreground">Select Payment Method</p>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors text-left",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <Button
                  className="w-full h-12"
                  disabled={!paymentMethod || isProcessing}
                  onClick={handlePay}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      Pay Rs {selectedPayment?.amount.toLocaleString()}
                      <ArrowUpRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-6 bg-muted/30 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-mono text-foreground">{selectedInvoice?.invoiceId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground">{selectedInvoice?.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Property</span>
                <span className="text-foreground text-right text-sm max-w-[200px]">
                  {selectedInvoice?.property}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date Paid</span>
                <span className="text-foreground">{selectedInvoice?.paidDate}</span>
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="font-medium text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-primary">
                  Rs {selectedInvoice?.amount.toLocaleString()}
                </span>
              </div>
            </div>
            <Button className="w-full gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

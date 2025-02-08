
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Plus, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
}

const Budget = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: 'expense' as const
  });
  const [isAdding, setIsAdding] = useState(false);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budget-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions).map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date)
      })));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('budget-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSaveTransaction = () => {
    if (!newTransaction.description.trim() || !newTransaction.amount) {
      toast.error("Please provide both description and amount");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      date: new Date(),
    };

    // Create calendar event for the transaction
    const calendarEvent = {
      id: `budget-${transaction.id}`,
      title: `${transaction.type === 'income' ? 'Income' : 'Expense'}: ${transaction.description}`,
      description: `Amount: $${transaction.amount.toFixed(2)}`,
      date: transaction.date,
      category: 'budget' as const
    };

    // Get existing calendar events
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    localStorage.setItem('calendar-events', JSON.stringify([...existingEvents, calendarEvent]));

    setTransactions([transaction, ...transactions]);
    setNewTransaction({ description: "", amount: "", type: 'expense' });
    setIsAdding(false);
    toast.success("Transaction saved successfully!");
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
    
    // Remove corresponding calendar event
    const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
    const updatedEvents = existingEvents.filter((event: any) => event.id !== `budget-${id}`);
    localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));
    
    toast.success("Transaction deleted successfully!");
  };

  const totalBalance = transactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                <h1 className="text-xl font-semibold">Budget Manager</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <Card className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold">
                Balance: ${totalBalance.toFixed(2)}
              </h2>
            </div>

            {isAdding ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Transaction description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={newTransaction.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                    className="flex-1"
                  >
                    Income
                  </Button>
                  <Button
                    variant={newTransaction.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                    className="flex-1"
                  >
                    Expense
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTransaction}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Transaction
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            )}
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{transaction.description}</h3>
                    <p className={`text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Budget;

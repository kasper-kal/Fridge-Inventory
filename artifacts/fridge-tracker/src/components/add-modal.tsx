import { useState, useRef } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus, Camera, PenLine, ChevronRight, X, Loader2, Save } from "lucide-react";
import { useCreateProduct, useParseReceipt, getListProductsQueryKey, getGetProductsSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AddModal() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "manual" | "scan">("menu");

  const resetAndClose = () => {
    setOpen(false);
    setTimeout(() => setView("menu"), 300);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-card px-6 pb-safe pt-2 border-t border-card-border rounded-t-3xl h-[85vh] max-h-[800px] outline-none">
        <DrawerTitle className="sr-only">Add Item</DrawerTitle>
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
        
        {view === "menu" && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Add to Inventory</h2>
            
            <button 
              onClick={() => setView("scan")}
              className="flex items-center p-5 bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg text-card-foreground">Scan Receipt</div>
                <div className="text-sm text-muted-foreground">Auto-detect items using AI</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button 
              onClick={() => setView("manual")}
              className="flex items-center p-5 bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <PenLine className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg text-card-foreground">Add Manually</div>
                <div className="text-sm text-muted-foreground">Type details yourself</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {view === "manual" && <ManualAddFlow onClose={resetAndClose} onBack={() => setView("menu")} />}
        {view === "scan" && <ScanReceiptFlow onClose={resetAndClose} onBack={() => setView("menu")} />}
        
      </DrawerContent>
    </Drawer>
  );
}

function ManualAddFlow({ onClose, onBack }: { onClose: () => void, onBack: () => void }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState<"fridge" | "freezer">("fridge");
  
  const queryClient = useQueryClient();
  const createMutation = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProductsSummaryQueryKey() });
        toast.success("Item added");
        onClose();
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Name is required");
    
    createMutation.mutate({
      data: {
        name,
        quantity: parseFloat(quantity) || 1,
        unit: unit || "pcs",
        storageLocation: location
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">Add Manually</h2>
        <Button variant="ghost" size="icon" onClick={onBack} type="button" className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Item Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Organic Milk" 
            className="h-12 rounded-xl bg-secondary/20"
            autoFocus
          />
        </div>
        
        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="qty" className="text-sm font-medium">Quantity</Label>
            <Input 
              id="qty" 
              type="number"
              step="any"
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              placeholder="1" 
              className="h-12 rounded-xl bg-secondary/20"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
            <Input 
              id="unit" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              placeholder="pcs, L, kg..." 
              className="h-12 rounded-xl bg-secondary/20"
              list="units"
            />
            <datalist id="units">
              <option value="pcs" />
              <option value="L" />
              <option value="ml" />
              <option value="kg" />
              <option value="g" />
            </datalist>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-sm font-medium">Store in</Label>
          <RadioGroup value={location} onValueChange={(v: "fridge"|"freezer") => setLocation(v)} className="flex gap-4">
            <div className="flex-1">
              <RadioGroupItem value="fridge" id="fridge" className="peer sr-only" />
              <Label 
                htmlFor="fridge" 
                className="flex flex-col items-center justify-center p-4 border-2 border-transparent bg-secondary/30 rounded-2xl peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all hover:bg-secondary/50"
              >
                <div className="font-semibold text-lg text-foreground">Fridge</div>
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem value="freezer" id="freezer" className="peer sr-only" />
              <Label 
                htmlFor="freezer" 
                className="flex flex-col items-center justify-center p-4 border-2 border-transparent bg-secondary/30 rounded-2xl peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/5 cursor-pointer transition-all hover:bg-secondary/50"
              >
                <div className="font-semibold text-lg text-foreground">Freezer</div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg"
        >
          {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2"/>}
          Save Item
        </Button>
      </div>
    </form>
  );
}

function ScanReceiptFlow({ onClose, onBack }: { onClose: () => void, onBack: () => void }) {
  const [step, setStep] = useState<"upload" | "ocr" | "api" | "confirm">("upload");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<{name: string, quantity: number, unit: string, location: "fridge"|"freezer"}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const queryClient = useQueryClient();
  const parseMutation = useParseReceipt();
  const createMutation = useCreateProduct();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("ocr");
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      setStep("api");
      const items = await parseMutation.mutateAsync({ data: { text: result.data.text } });
      
      setParsedItems(items.map(i => ({
        name: i.name,
        quantity: i.quantity || 1,
        unit: i.unit || "pcs",
        location: "fridge"
      })));
      setStep("confirm");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process receipt");
      setStep("upload");
    }
  };

  const handleSaveAll = async () => {
    if (parsedItems.length === 0) return onClose();
    
    let saved = 0;
    for (const item of parsedItems) {
      try {
        await createMutation.mutateAsync({
          data: {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            storageLocation: item.location
          }
        });
        saved++;
      } catch (e) {
        console.error("Failed to save item", item, e);
      }
    }
    
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetProductsSummaryQueryKey() });
    toast.success(`Saved ${saved} items`);
    onClose();
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...parsedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setParsedItems(newItems);
  };

  const removeItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-card-foreground">Scan Receipt</h2>
        <Button variant="ghost" size="icon" onClick={step === 'upload' ? onBack : () => setStep('upload')} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {step === "upload" && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-center text-muted-foreground max-w-[250px]">
              Take a photo of your receipt or upload one from your gallery.
            </p>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button 
              size="lg" 
              className="w-full max-w-xs h-14 rounded-2xl text-lg font-bold"
              onClick={() => fileInputRef.current?.click()}
            >
              Open Camera
            </Button>
          </div>
        )}

        {(step === "ocr" || step === "api") && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-secondary rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1.5s' }}
              ></div>
              <span className="text-lg font-bold text-primary">{step === 'ocr' ? `${ocrProgress}%` : 'AI'}</span>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                {step === 'ocr' ? 'Reading Text...' : 'Identifying Items...'}
              </h3>
              <p className="text-muted-foreground">This might take a moment.</p>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 pb-4">
            <p className="font-medium text-muted-foreground mb-4">Review detected items ({parsedItems.length})</p>
            
            {parsedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No items detected.</div>
            ) : (
              parsedItems.map((item, i) => (
                <div key={i} className="bg-secondary/20 border border-secondary p-4 rounded-2xl space-y-3 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItem(i)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="pr-10">
                    <Input 
                      value={item.name} 
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="font-semibold text-lg border-transparent bg-transparent hover:bg-secondary/40 focus:bg-background px-2 -ml-2 transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(i, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-20 bg-background"
                    />
                    <Input 
                      value={item.unit} 
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                      className="w-24 bg-background"
                    />
                    <div className="flex bg-background rounded-md border p-1 ml-auto">
                      <button 
                        type="button"
                        onClick={() => updateItem(i, "location", "fridge")}
                        className={`px-3 py-1 text-xs font-medium rounded ${item.location === 'fridge' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Fridge
                      </button>
                      <button 
                        type="button"
                        onClick={() => updateItem(i, "location", "freezer")}
                        className={`px-3 py-1 text-xs font-medium rounded ${item.location === 'freezer' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Freezer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {step === "confirm" && (
        <div className="pt-4 mt-auto shrink-0 bg-card border-t -mx-6 px-6 pb-2">
          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg"
            onClick={handleSaveAll}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Save className="w-5 h-5 mr-2"/>}
            Save All Items
          </Button>
        </div>
      )}
    </div>
  );
}

// Need to add Trash2 import that was missed above
import { Trash2 } from "lucide-react";

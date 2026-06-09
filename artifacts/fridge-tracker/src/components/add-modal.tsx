import { useState, useRef } from "react";
import { Trash2, Plus, Camera, PenLine, ChevronRight, X, Loader2, Save, Upload } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useCreateProduct,
  useParseReceipt,
  getListProductsQueryKey,
  getGetProductsSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

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
        <DrawerTitle className="sr-only">Item toevoegen</DrawerTitle>
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />

        {view === "menu" && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">Toevoegen aan voorraad</h2>

            <button
              onClick={() => setView("scan")}
              className="flex items-center p-5 bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg text-card-foreground">Bon scannen</div>
                <div className="text-sm text-muted-foreground">Items automatisch detecteren met AI</div>
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
                <div className="font-semibold text-lg text-card-foreground">Handmatig toevoegen</div>
                <div className="text-sm text-muted-foreground">Vul zelf de details in</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {view === "manual" && (
          <ManualAddFlow onClose={resetAndClose} onBack={() => setView("menu")} />
        )}
        {view === "scan" && (
          <ScanReceiptFlow onClose={resetAndClose} onBack={() => setView("menu")} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function ManualAddFlow({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
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
        toast.success("Item toegevoegd");
        onClose();
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Naam is verplicht");
    createMutation.mutate({
      data: {
        name: name.trim(),
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim() || "st",
        storageLocation: location,
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">Handmatig toevoegen</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          type="button"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Productnaam
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="bijv. Biologische Melk"
            className="h-12 rounded-xl bg-secondary/20"
            autoFocus
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <Label htmlFor="qty" className="text-sm font-medium">
              Hoeveelheid
            </Label>
            <Input
              id="qty"
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="h-12 rounded-xl bg-secondary/20"
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label htmlFor="unit" className="text-sm font-medium">
              Eenheid
            </Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="st, L, kg..."
              className="h-12 rounded-xl bg-secondary/20"
              list="units"
            />
            <datalist id="units">
              <option value="st" />
              <option value="L" />
              <option value="ml" />
              <option value="kg" />
              <option value="g" />
            </datalist>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-sm font-medium">Bewaren in</Label>
          <RadioGroup
            value={location}
            onValueChange={(v: "fridge" | "freezer") => setLocation(v)}
            className="flex gap-4"
          >
            <div className="flex-1">
              <RadioGroupItem value="fridge" id="fridge-manual" className="peer sr-only" />
              <Label
                htmlFor="fridge-manual"
                className="flex flex-col items-center justify-center p-4 border-2 border-transparent bg-secondary/30 rounded-2xl peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all hover:bg-secondary/50"
              >
                <div className="font-semibold text-lg text-foreground">Koelkast</div>
              </Label>
            </div>
            <div className="flex-1">
              <RadioGroupItem value="freezer" id="freezer-manual" className="peer sr-only" />
              <Label
                htmlFor="freezer-manual"
                className="flex flex-col items-center justify-center p-4 border-2 border-transparent bg-secondary/30 rounded-2xl peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/5 cursor-pointer transition-all hover:bg-secondary/50"
              >
                <div className="font-semibold text-lg text-foreground">Vriezer</div>
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
          {createMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Item opslaan
        </Button>
      </div>
    </form>
  );
}

function ScanReceiptFlow({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [step, setStep] = useState<"upload" | "ocr" | "api" | "confirm">("upload");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<
    { name: string; quantity: number; unit: string; location: "fridge" | "freezer" }[]
  >([]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const parseMutation = useParseReceipt();
  const createMutation = useCreateProduct();

  const processFile = async (file: File) => {
    setStep("ocr");
    setOcrProgress(0);
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const ocrText = result.data.text.trim();
      if (!ocrText) {
        toast.error("Geen tekst gevonden in de afbeelding. Probeer een duidelijkere foto.");
        setStep("upload");
        return;
      }

      setStep("api");
      const items = await parseMutation.mutateAsync({ data: { text: ocrText } });

      setParsedItems(
        items.map((i) => ({
          name: i.name,
          quantity: i.quantity ?? 1,
          unit: i.unit ?? "st",
          location: "fridge" as const,
        }))
      );
      setStep("confirm");
    } catch (err) {
      console.error(err);
      toast.error("Verwerken van bon mislukt. Probeer het opnieuw.");
      setStep("upload");
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
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
            storageLocation: item.location,
          },
        });
        saved++;
      } catch (e) {
        console.error("Opslaan mislukt", item, e);
      }
    }

    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetProductsSummaryQueryKey() });
    toast.success(`${saved} item${saved !== 1 ? "s" : ""} opgeslagen`);
    onClose();
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setParsedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-card-foreground">Bon scannen</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={step === "upload" ? onBack : () => { setStep("upload"); setParsedItems([]); }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        {step === "upload" && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Camera className="w-10 h-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-card-foreground">Voeg een bonafbeelding toe</p>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                Tekst wordt lokaal uitgelezen op je apparaat. Alleen de tekst wordt naar AI gestuurd — nooit de afbeelding.
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={handleCameraChange}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                size="lg"
                className="w-full h-14 rounded-2xl text-base font-bold"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-5 h-5 mr-2" />
                Foto nemen
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 rounded-2xl text-base font-bold"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Uploaden van apparaat
              </Button>
            </div>
          </div>
        )}

        {(step === "ocr" || step === "api") && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-secondary rounded-full" />
              <div
                className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: "1.5s" }}
              />
              <span className="text-lg font-bold text-primary">
                {step === "ocr" ? `${ocrProgress}%` : "AI"}
              </span>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                {step === "ocr" ? "Tekst lezen..." : "Items identificeren..."}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step === "ocr"
                  ? "Bon lokaal scannen op je apparaat"
                  : "Bontekst naar AI sturen"}
              </p>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 pb-4">
            <p className="font-medium text-muted-foreground mb-2">
              Bekijk {parsedItems.length} gedetecteerd{parsedItems.length !== 1 ? "e items" : " item"}
            </p>

            {parsedItems.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-muted-foreground">Er zijn geen items gedetecteerd.</p>
                <Button variant="outline" onClick={() => setStep("upload")}>
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              parsedItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-secondary/20 border border-secondary p-4 rounded-2xl space-y-3 relative"
                >
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
                      className="font-semibold text-base border-transparent bg-transparent hover:bg-secondary/40 focus:bg-background px-2 -ml-2 transition-colors"
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", parseFloat(e.target.value) || 0)
                      }
                      className="w-20 bg-background"
                    />
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                      className="w-24 bg-background"
                      list="confirm-units"
                    />
                    <datalist id="confirm-units">
                      <option value="st" />
                      <option value="L" />
                      <option value="ml" />
                      <option value="kg" />
                      <option value="g" />
                    </datalist>
                    <div className="flex bg-background rounded-lg border p-1 ml-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => updateItem(i, "location", "fridge")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          item.location === "fridge"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Koelkast
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItem(i, "location", "freezer")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          item.location === "freezer"
                            ? "bg-blue-500 text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Vriezer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {step === "confirm" && parsedItems.length > 0 && (
        <div className="pt-4 mt-auto shrink-0 bg-card border-t -mx-6 px-6 pb-2">
          <Button
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg"
            onClick={handleSaveAll}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Alle {parsedItems.length} item{parsedItems.length !== 1 ? "s" : ""} opslaan
          </Button>
        </div>
      )}
    </div>
  );
}

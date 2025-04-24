import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { 
  Share2, 
  Linkedin, 
  Facebook, 
  Twitter, 
  Mail, 
  Copy, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AchievementShareProps {
  courseTitle: string;
  courseCategory: string;
  courseLevel: string;
  completionDate?: Date;
  variant?: "button" | "dialog" | "inline";
  className?: string;
}

export function AchievementShare({
  courseTitle,
  courseCategory,
  courseLevel,
  completionDate,
  variant = "button",
  className
}: AchievementShareProps) {
  const [socialPlatform, setSocialPlatform] = useState<string>("linkedin");
  const [shareText, setShareText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const generateShareText = (platform: string) => {
    const dateText = completionDate ? ` le ${formatDate(completionDate)}` : "";
    
    let text = "";
    switch (platform) {
      case "linkedin":
        text = `Heureux d'avoir terminé la formation "${courseTitle}" dans la catégorie ${courseCategory}${dateText}. #Formation #${courseCategory.replace(/\s+/g, "")} #DéveloppementProfessionnel`;
        break;
      case "twitter":
        text = `Je viens de terminer la formation "${courseTitle}" (${courseLevel}) chez TechFormPro${dateText}! #Formation #${courseCategory.replace(/\s+/g, "")}`;
        break;
      case "facebook":
        text = `Je viens de terminer avec succès la formation "${courseTitle}" chez TechFormPro${dateText}. Une étape importante dans mon parcours professionnel!`;
        break;
      case "email":
        text = `Bonjour,\n\nJe souhaitais partager avec vous que j'ai terminé la formation "${courseTitle}" dans la catégorie ${courseCategory} (niveau ${courseLevel})${dateText}.\n\nCette formation m'a permis d'acquérir de nouvelles compétences que je pourrai mettre à profit dans mes projets futurs.\n\nCordialement`;
        break;
      default:
        text = `Formation "${courseTitle}" - ${courseCategory} (${courseLevel}) terminée${dateText}.`;
    }
    
    return text;
  };

  const handlePlatformChange = (platform: string) => {
    setSocialPlatform(platform);
    setShareText(generateShareText(platform));
  };

  const handleShare = () => {
    // Construction de l'URL avec les paramètres
    const params = new URLSearchParams();
    const baseUrl = window.location.origin;
    const text = shareText || generateShareText(socialPlatform);
    
    let shareUrl = "";
    
    switch (socialPlatform) {
      case "linkedin":
        // LinkedIn partage est plus limité, utilise juste le texte et l'URL
        params.append("url", `${baseUrl}/catalog`);
        params.append("summary", text);
        params.append("title", `Formation terminée : ${courseTitle}`);
        params.append("source", "TechFormPro");
        shareUrl = `https://www.linkedin.com/shareArticle?${params.toString()}`;
        break;
        
      case "twitter":
        params.append("text", text);
        params.append("url", `${baseUrl}/catalog`);
        shareUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
        break;
        
      case "facebook":
        params.append("u", `${baseUrl}/catalog`);
        params.append("quote", text);
        shareUrl = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
        break;
        
      case "email":
        params.append("subject", `Formation terminée : ${courseTitle}`);
        params.append("body", text);
        shareUrl = `mailto:?${params.toString()}`;
        break;
        
      case "copy":
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          toast({
            title: "Texte copié !",
            description: "Le message a été copié dans le presse-papier.",
          });
          setTimeout(() => setCopied(false), 2000);
        });
        return;
    }
    
    // Ouvre le lien de partage dans une nouvelle fenêtre
    if (shareUrl && socialPlatform !== "copy") {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const getShareIcon = () => {
    switch (socialPlatform) {
      case "linkedin":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "twitter":
        return <Twitter className="h-4 w-4 mr-2" />;
      case "facebook":
        return <Facebook className="h-4 w-4 mr-2" />;
      case "email":
        return <Mail className="h-4 w-4 mr-2" />;
      case "copy":
        return copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />;
      default:
        return <Share2 className="h-4 w-4 mr-2" />;
    }
  };

  const shareOptions = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "facebook", label: "Facebook" },
    { value: "email", label: "Email" },
    { value: "copy", label: "Copier le texte" },
  ];

  // Pour le variant "button", on affiche juste un bouton qui ouvre le dialog
  if (variant === "button") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className={cn("text-sm", className)}
            onClick={() => setShareText(generateShareText("linkedin"))}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partager cet accomplissement
          </Button>
        </DialogTrigger>
        <ShareDialogContent 
          courseTitle={courseTitle}
          shareOptions={shareOptions}
          socialPlatform={socialPlatform}
          handlePlatformChange={handlePlatformChange}
          shareText={shareText || generateShareText(socialPlatform)}
          setShareText={setShareText}
          handleShare={handleShare}
          getShareIcon={getShareIcon}
        />
      </Dialog>
    );
  }

  // Pour le variant "inline", on affiche directement les boutons de partage
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {shareOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            size="sm"
            className={cn(
              "p-2 h-auto",
              option.value === "linkedin" && "bg-[#0077B5]/10 hover:bg-[#0077B5]/20",
              option.value === "twitter" && "bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20",
              option.value === "facebook" && "bg-[#4267B2]/10 hover:bg-[#4267B2]/20",
              option.value === "email" && "bg-gray-100 hover:bg-gray-200",
              option.value === "copy" && "bg-purple-100 hover:bg-purple-200",
            )}
            onClick={() => {
              setSocialPlatform(option.value);
              handleShare();
            }}
          >
            {option.value === "linkedin" && <Linkedin className="h-4 w-4" />}
            {option.value === "twitter" && <Twitter className="h-4 w-4" />}
            {option.value === "facebook" && <Facebook className="h-4 w-4" />}
            {option.value === "email" && <Mail className="h-4 w-4" />}
            {option.value === "copy" && (copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />)}
          </Button>
        ))}
      </div>
    );
  }

  // Pour le variant "dialog", on affiche directement le dialog
  return (
    <Dialog defaultOpen>
      <ShareDialogContent 
        courseTitle={courseTitle}
        shareOptions={shareOptions}
        socialPlatform={socialPlatform}
        handlePlatformChange={handlePlatformChange}
        shareText={shareText || generateShareText(socialPlatform)}
        setShareText={setShareText}
        handleShare={handleShare}
        getShareIcon={getShareIcon}
      />
    </Dialog>
  );
}

// Composant pour le contenu du dialog de partage
function ShareDialogContent({ 
  courseTitle,
  shareOptions,
  socialPlatform,
  handlePlatformChange,
  shareText,
  setShareText,
  handleShare,
  getShareIcon
}: {
  courseTitle: string;
  shareOptions: { value: string; label: string }[];
  socialPlatform: string;
  handlePlatformChange: (platform: string) => void;
  shareText: string;
  setShareText: (text: string) => void;
  handleShare: () => void;
  getShareIcon: () => JSX.Element;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Partager votre accomplissement</DialogTitle>
        <DialogDescription>
          Partagez avec votre réseau que vous avez terminé la formation "{courseTitle}".
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="platform">Plateforme</Label>
          <Select value={socialPlatform} onValueChange={handlePlatformChange}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Choisir une plateforme" />
            </SelectTrigger>
            <SelectContent>
              {shareOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="share-text">Message</Label>
          <Textarea
            id="share-text"
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handleShare} className="w-full sm:w-auto">
          {getShareIcon()}
          {socialPlatform === "copy" 
            ? (copied ? "Copié !" : "Copier le texte") 
            : `Partager sur ${shareOptions.find(o => o.value === socialPlatform)?.label}`}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
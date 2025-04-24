import React, { useState } from "react";
import { SocialShare } from "@/components/social-share";
import { Button } from "@/components/ui/button";
import { ShareIcon, Award, BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  completionDate = new Date(),
  variant = "button",
  className = "",
}: AchievementShareProps) {
  const [open, setOpen] = useState(false);
  const [shareType, setShareType] = useState<"completion" | "participation" | "certification">("completion");
  const [includeDetails, setIncludeDetails] = useState(true);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  
  // Generate appropriate message based on share type
  const getShareTitle = () => {
    switch (shareType) {
      case "completion":
        return `J'ai terminé la formation "${courseTitle}"`;
      case "participation":
        return `J'ai participé à la formation "${courseTitle}"`;
      case "certification":
        return `J'ai obtenu ma certification pour "${courseTitle}"`;
    }
  };
  
  const getShareDescription = () => {
    if (!includeDetails) return "";
    
    return `${getShareTitle()} sur TechFormPro le ${formatDate(completionDate)}. ${
      shareType === "completion" || shareType === "certification" 
        ? `Cette formation de niveau ${courseLevel} dans la catégorie ${courseCategory} m'a permis d'acquérir de nouvelles compétences.`
        : `Cette formation de niveau ${courseLevel} dans la catégorie ${courseCategory} était très enrichissante.`
    }`;
  };
  
  // Get hashtags based on course category and level
  const getHashtags = () => {
    const tags = ["TechFormPro", "FormationIT", courseCategory.replace(/\s+/g, '')];
    
    switch (shareType) {
      case "completion":
        tags.push("Formation", "CompétencesNumériques");
        break;
      case "participation":
        tags.push("Apprentissage", "DéveloppementProfessionnel");
        break;
      case "certification":
        tags.push("Certification", "ReconnaissanceProfessionnelle");
        break;
    }
    
    return tags;
  };
  
  // Render inline version
  if (variant === "inline") {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="text-lg font-medium flex items-center text-indigo-800 mb-3">
            <Award className="h-5 w-5 mr-2 text-indigo-600" />
            Félicitations pour votre accomplissement !
          </h3>
          <p className="text-gray-700 mb-4">
            Partagez votre réussite avec votre réseau et valorisez vos nouvelles compétences.
          </p>
          
          <SocialShare 
            title={getShareTitle()}
            description={getShareDescription()}
            hashtags={getHashtags()}
            achievementMode={true}
            variant="default"
          />
        </div>
      </div>
    );
  }
  
  // Render as dialog trigger button
  if (variant === "button") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className={`flex items-center gap-2 ${className}`} 
            onClick={() => setOpen(true)}
          >
            <ShareIcon className="h-4 w-4" />
            Partager mon accomplissement
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager votre accomplissement</DialogTitle>
            <DialogDescription>
              Valorisez votre parcours d'apprentissage en partageant cette formation avec votre réseau.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <RadioGroup 
                defaultValue="completion" 
                value={shareType}
                onValueChange={(val) => setShareType(val as "completion" | "participation" | "certification")}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                  <RadioGroupItem value="completion" id="completion" />
                  <Label htmlFor="completion" className="flex items-center cursor-pointer">
                    <BadgeCheck className="h-5 w-5 mr-2 text-green-600" />
                    J'ai terminé cette formation
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                  <RadioGroupItem value="participation" id="participation" />
                  <Label htmlFor="participation" className="flex items-center cursor-pointer">
                    <ShareIcon className="h-5 w-5 mr-2 text-blue-600" />
                    J'ai participé à cette formation
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                  <RadioGroupItem value="certification" id="certification" />
                  <Label htmlFor="certification" className="flex items-center cursor-pointer">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    J'ai obtenu ma certification
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-details" 
                checked={includeDetails}
                onCheckedChange={setIncludeDetails}
              />
              <Label htmlFor="include-details">Inclure les détails de la formation</Label>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Aperçu du message :</p>
              <p className="text-sm font-medium text-gray-800">{getShareTitle()}</p>
              {includeDetails && (
                <p className="text-sm text-gray-600 mt-1">{getShareDescription()}</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Partager via</h4>
              <SocialShare 
                title={getShareTitle()}
                description={getShareDescription()}
                hashtags={getHashtags()}
                achievementMode={true}
                variant="icons-only"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Default dialog version
  return (
    <div className={className}>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ShareIcon className="h-4 w-4 mr-2" />
            Partager mon accomplissement
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager votre accomplissement</DialogTitle>
            <DialogDescription>
              Valorisez votre parcours d'apprentissage en partageant cette formation avec votre réseau.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <SocialShare 
              title={`J'ai terminé la formation "${courseTitle}"`}
              description={`J'ai terminé la formation "${courseTitle}" sur TechFormPro le ${formatDate(completionDate)}. Cette formation de niveau ${courseLevel} dans la catégorie ${courseCategory} m'a permis d'acquérir de nouvelles compétences.`}
              hashtags={["TechFormPro", "FormationIT", courseCategory.replace(/\s+/g, ''), "Formation"]}
              achievementMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
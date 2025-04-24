import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Share2, 
  Copy
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  variant?: "default" | "compact" | "icons-only";
  showCopyLink?: boolean;
  achievementMode?: boolean;
}

export function SocialShare({
  title,
  url = window.location.href,
  description = "",
  hashtags = ["TechFormPro", "FormationIT"],
  className = "",
  variant = "default",
  showCopyLink = true,
  achievementMode = false
}: SocialShareProps) {
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(achievementMode ? 
    `🎓 Je viens de compléter "${title}" sur TechFormPro!` : 
    `Découvrez cette formation: ${title}`
  );
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = hashtags.join(",");
  
  // Prepare sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié",
      description: "Le lien a été copié dans le presse-papier",
    });
  };
  
  if (variant === "icons-only") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(twitterUrl, '_blank')}
                className="text-[#1DA1F2] hover:text-[#1DA1F2]/80 hover:bg-[#1DA1F2]/10"
              >
                <Twitter size={18} />
                <span className="sr-only">Partager sur Twitter</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partager sur Twitter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(facebookUrl, '_blank')}
                className="text-[#4267B2] hover:text-[#4267B2]/80 hover:bg-[#4267B2]/10"
              >
                <Facebook size={18} />
                <span className="sr-only">Partager sur Facebook</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partager sur Facebook</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(linkedinUrl, '_blank')}
                className="text-[#0077b5] hover:text-[#0077b5]/80 hover:bg-[#0077b5]/10"
              >
                <Linkedin size={18} />
                <span className="sr-only">Partager sur LinkedIn</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partager sur LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.open(mailUrl, '_blank')}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <Mail size={18} />
                <span className="sr-only">Partager par email</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Partager par email</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {showCopyLink && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleCopyLink}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Copy size={18} />
                  <span className="sr-only">Copier le lien</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copier le lien</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
  
  if (variant === "compact") {
    return (
      <div className={`flex items-center ${className}`}>
        <Button 
          variant="outline" 
          size="sm"
          className="mr-2"
          onClick={() => {
            const menu = document.createElement('div');
            menu.innerHTML = `
              <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="block p-2 hover:bg-gray-100">Twitter</a>
              <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="block p-2 hover:bg-gray-100">Facebook</a>
              <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="block p-2 hover:bg-gray-100">LinkedIn</a>
              <a href="${mailUrl}" target="_blank" rel="noopener noreferrer" class="block p-2 hover:bg-gray-100">Email</a>
            `;
          }}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Partager
        </Button>
        
        {showCopyLink && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copier
          </Button>
        )}
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(twitterUrl, '_blank')}
          className="text-[#1DA1F2] border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(facebookUrl, '_blank')}
          className="text-[#4267B2] border-[#4267B2]/30 hover:bg-[#4267B2]/10"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(linkedinUrl, '_blank')}
          className="text-[#0077b5] border-[#0077b5]/30 hover:bg-[#0077b5]/10"
        >
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(mailUrl, '_blank')}
          className="text-gray-600 border-gray-300 hover:bg-gray-100"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
      
      {showCopyLink && (
        <div>
          <div className="flex mt-2">
            <input 
              type="text" 
              value={url} 
              readOnly 
              className="flex-1 px-3 py-1 text-sm border rounded-l-md focus:outline-none bg-gray-50"
            />
            <Button 
              variant="secondary" 
              size="sm" 
              className="rounded-l-none"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { useLocation } from 'wouter';

interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin')} 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Tableau de bord
          </button>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
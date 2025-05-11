import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

type Course = {
  id: number;
  title: string;
  trainerName: string;
  category: string;
  isApproved: boolean;
  createdAt: string;
};

interface PendingApprovalsProps {
  pendingApprovals: number;
  courses?: Course[];
  onApprove?: (courseId: number) => void;
  onReject?: (courseId: number) => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  pendingApprovals,
  courses = [],
  onApprove,
  onReject
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Approbations en attente</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            {pendingApprovals} en attente
          </Badge>
        </div>
        <CardDescription>Formations nécessitant une validation</CardDescription>
      </CardHeader>
      <CardContent>
        {courses?.length > 0 ? (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{course.title}</p>
                  <div className="text-sm text-muted-foreground">
                    <span>Par {course.trainerName}</span>
                    <span className="mx-2">•</span>
                    <span>{course.category || "Non catégorisé"}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => onApprove?.(course.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approuver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => onReject?.(course.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-muted-foreground">Aucune approbation en attente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovals;
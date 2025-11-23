import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  History, 
  Edit, 
  Settings, 
  FileImage, 
  Info,
  RotateCcw,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function RevisionHistory({ revisions, currentPage }) {
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  
  if (!revisions || revisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-600" />
            Revision History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Revision History</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Changes to the book will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Group revisions by day
  const groupedRevisions = revisions.reduce((groups, revision) => {
    const date = new Date(revision.created_date);
    const day = format(date, "MMMM d, yyyy");
    
    if (!groups[day]) {
      groups[day] = [];
    }
    
    groups[day].push(revision);
    return groups;
  }, {});
  
  const getContentTypeIcon = (type) => {
    switch (type) {
      case "text":
        return <Edit className="h-4 w-4" />;
      case "setting":
        return <Settings className="h-4 w-4" />;
      case "illustration":
        return <FileImage className="h-4 w-4" />;
      case "meta":
        return <Info className="h-4 w-4" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };
  
  const getContentTypeLabel = (type) => {
    switch (type) {
      case "text":
        return "Text Edit";
      case "setting":
        return "Setting Change";
      case "illustration":
        return "Illustration Update";
      case "meta":
        return "Metadata Update";
      default:
        return "Edit";
    }
  };
  
  const getContentTypeBadgeColor = (type) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "setting":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "illustration":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "meta":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };
  
  const handleShowDiff = (revision) => {
    setSelectedRevision(revision);
    setShowDiffDialog(true);
  };
  
  // For a real implementation, you'd use a diff library here
  const renderTextDiff = (oldText, newText) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Previous Version:</h3>
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-md whitespace-pre-wrap">
            {oldText || "(Empty)"}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">New Version:</h3>
          <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-md whitespace-pre-wrap">
            {newText || "(Empty)"}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-600" />
          Revision History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedRevisions).map(([day, dayRevisions], i) => (
            <AccordionItem key={i} value={`day-${i}`}>
              <AccordionTrigger className="text-base font-medium">
                {day}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  {dayRevisions.map((revision, j) => (
                    <div key={j} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={revision.user?.full_name ? 
                          `https://ui-avatars.com/api/?name=${revision.user.full_name}&background=random` : 
                          undefined
                        } />
                        <AvatarFallback>
                          {revision.user?.full_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium">
                            {revision.user?.full_name || "Unknown User"}
                          </span>
                          <Badge className={`flex items-center gap-1 ${getContentTypeBadgeColor(revision.content_type)}`}>
                            {getContentTypeIcon(revision.content_type)}
                            {getContentTypeLabel(revision.content_type)}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(revision.created_date), "h:mm a")}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {revision.field_name === "text_content" ? (
                            <>Updated page text</>
                          ) : (
                            <>Updated {revision.field_name}</>
                          )}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleShowDiff(revision)}
                            className="text-xs h-7 px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Changes
                          </Button>
                          
                          {/* In a real app, you might want to implement a rollback feature */}
                          {/* <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-7 px-2"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Restore Version
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      
      {/* Diff Dialog */}
      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revision Changes</DialogTitle>
            <DialogDescription>
              Made by {selectedRevision?.user?.full_name || "Unknown User"} on {selectedRevision && 
                format(new Date(selectedRevision.created_date), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRevision && (
            <div className="py-4">
              {renderTextDiff(selectedRevision.previous_value, selectedRevision.new_value)}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowDiffDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
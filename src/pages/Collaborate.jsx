import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { User } from "@/entities/User";
import { Collaboration } from "@/entities/Collaboration";
import { Comment } from "@/entities/Comment";
import { Revision } from "@/entities/Revision";
import { SendEmail } from "@/integrations/Core";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  History, 
  Edit, 
  Check,
  ArrowLeft,
  UserPlus,
  Save,
  RotateCw,
  Clock,
  Send,
  X,
  Share,
  Eye,
  Pen,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import CollaboratorsList from "../components/collaborate/CollaboratorsList";
import CollaborationInviteForm from "../components/collaborate/CollaborationInviteForm";
import RevisionHistory from "../components/collaborate/RevisionHistory";
import CollaborativeEditor from "../components/collaborate/CollaborativeEditor";
import PageComments from "../components/collaborate/PageComments";

export default function Collaborate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [collaborators, setCollaborators] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [bookStatus, setBookStatus] = useState("being-edited");
  
  // Get book ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  
  // Set up polling for real-time updates
  useEffect(() => {
    if (!bookId) return;
    
    const pollingInterval = setInterval(() => {
      if (activeTab === "editor") {
        refreshPageContent();
      } else if (activeTab === "comments") {
        refreshComments();
      } else if (activeTab === "revisions") {
        refreshRevisions();
      } else if (activeTab === "collaborators") {
        refreshCollaborators();
      }
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(pollingInterval);
  }, [bookId, activeTab, currentPageIndex]);
  
  useEffect(() => {
    loadInitialData();
  }, [bookId]);
  
  useEffect(() => {
    if (pages.length > 0 && currentPageIndex >= 0 && currentPageIndex < pages.length) {
      setCurrentPage(pages[currentPageIndex]);
      setEditorContent(pages[currentPageIndex].text_content || "");
      loadCommentsForCurrentPage();
    }
  }, [pages, currentPageIndex]);
  
  const loadInitialData = async () => {
    if (!bookId) {
      navigate(createPageUrl("Library"));
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Load current user
      const user = await User.me();
      setCurrentUser(user);
      
      // Load book data
      const bookData = await Book.get(bookId);
      setBook(bookData);
      
      // Check if user is owner
      const isBookOwner = bookData.created_by === user.email;
      setIsOwner(isBookOwner);
      
      // If not owner, check if user is collaborator
      if (!isBookOwner) {
        const collaborations = await Collaboration.filter({
          book_id: bookId,
          collaborator_email: user.email,
          status: "accepted"
        });
        
        if (collaborations.length === 0) {
          // User doesn't have access
          toast({
            variant: "destructive",
            description: "You don't have access to this book."
          });
          navigate(createPageUrl("Library"));
          return;
        }
      }
      
      // Load pages
      const pagesData = await Page.filter({ book_id: bookId }, "page_number");
      setPages(pagesData);
      
      if (pagesData.length > 0) {
        setCurrentPageIndex(0);
        setCurrentPage(pagesData[0]);
        setEditorContent(pagesData[0].text_content || "");
      }
      
      // Load collaborators
      await refreshCollaborators();
      
      // Load revisions
      await refreshRevisions();
      
      // Update last active timestamp
      if (!isBookOwner) {
        const collab = await Collaboration.filter({
          book_id: bookId,
          collaborator_email: user.email
        });
        
        if (collab.length > 0) {
          await Collaboration.update(collab[0].id, {
            last_active: new Date().toISOString()
          });
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading book data:", error);
      toast({
        variant: "destructive",
        description: "Failed to load book. Please try again."
      });
      navigate(createPageUrl("Library"));
    }
  };
  
  const refreshCollaborators = async () => {
    try {
      const collabs = await Collaboration.filter({
        book_id: bookId
      });
      
      // Enhance with user data
      const enhancedCollabs = await Promise.all(
        collabs.map(async (collab) => {
          try {
            // Try to get user data if the user exists in the system
            const userData = await User.filter({
              email: collab.collaborator_email
            });
            
            if (userData.length > 0) {
              return {
                ...collab,
                user: userData[0]
              };
            }
            
            // If user doesn't exist yet, return just the email
            return collab;
          } catch (error) {
            return collab;
          }
        })
      );
      
      setCollaborators(enhancedCollabs);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };
  
  const refreshRevisions = async () => {
    try {
      const revs = await Revision.filter({
        book_id: bookId
      }, "-created_date", 20); // Get most recent 20 revisions
      
      // Enhance with user data
      const enhancedRevs = await Promise.all(
        revs.map(async (rev) => {
          try {
            const user = await User.get(rev.user_id);
            return {
              ...rev,
              user
            };
          } catch (error) {
            return {
              ...rev,
              user: { full_name: "Unknown User" }
            };
          }
        })
      );
      
      setRevisions(enhancedRevs);
    } catch (error) {
      console.error("Error loading revisions:", error);
    }
  };
  
  const refreshComments = async () => {
    if (!currentPage) return;
    
    await loadCommentsForCurrentPage();
  };
  
  const loadCommentsForCurrentPage = async () => {
    if (!currentPage) return;
    
    try {
      // Get comments for current page
      const pageComments = await Comment.filter({
        book_id: bookId,
        page_id: currentPage.id
      }, "-created_date");
      
      // Enhance with user data
      const enhancedComments = await Promise.all(
        pageComments.map(async (comment) => {
          try {
            const user = await User.get(comment.user_id);
            return {
              ...comment,
              user
            };
          } catch (error) {
            return {
              ...comment,
              user: { full_name: "Unknown User" }
            };
          }
        })
      );
      
      // Group by parent/child
      const rootComments = enhancedComments.filter(c => !c.parent_id);
      
      const commentTree = rootComments.map(rootComment => {
        const replies = enhancedComments.filter(c => c.parent_id === rootComment.id);
        return {
          ...rootComment,
          replies
        };
      });
      
      setComments(commentTree);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };
  
  const refreshPageContent = async () => {
    if (!currentPage) return;
    
    try {
      // Check if the current page has been updated
      const refreshedPage = await Page.get(currentPage.id);
      
      // If content is different than what we have in editor and user is not currently editing
      if (refreshedPage.text_content !== editorContent && !isSaving) {
        // Update pages array
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = refreshedPage;
        setPages(updatedPages);
        
        // Update current page
        setCurrentPage(refreshedPage);
        
        // Update editor content if it hasn't been modified locally
        setEditorContent(refreshedPage.text_content || "");
        
        toast({
          description: "The page has been updated by a collaborator."
        });
      }
    } catch (error) {
      console.error("Error refreshing page content:", error);
    }
  };
  
  const handleSavePage = async () => {
    if (!currentPage || editorContent === currentPage.text_content) return;
    
    try {
      setIsSaving(true);
      
      // Update page
      const previousContent = currentPage.text_content;
      await Page.update(currentPage.id, { text_content: editorContent });
      
      // Record revision
      await Revision.create({
        book_id: bookId,
        page_id: currentPage.id,
        user_id: currentUser.id,
        content_type: "text",
        previous_value: previousContent,
        new_value: editorContent,
        field_name: "text_content"
      });
      
      // Update local page data
      const updatedPages = [...pages];
      updatedPages[currentPageIndex] = {
        ...currentPage,
        text_content: editorContent
      };
      setPages(updatedPages);
      setCurrentPage({
        ...currentPage,
        text_content: editorContent
      });
      
      // Refresh revisions
      await refreshRevisions();
      
      toast({
        description: "Page saved successfully."
      });
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        variant: "destructive",
        description: "Failed to save page. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddComment = async (content, position = null) => {
    if (!currentPage || !content.trim()) return;
    
    try {
      // Create comment
      await Comment.create({
        book_id: bookId,
        page_id: currentPage.id,
        user_id: currentUser.id,
        content,
        position
      });
      
      // Refresh comments
      await loadCommentsForCurrentPage();
      
      toast({
        description: "Comment added successfully."
      });
      
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        description: "Failed to add comment. Please try again."
      });
      return false;
    }
  };
  
  const handleReplyToComment = async (parentId, content) => {
    if (!content.trim()) return false;
    
    try {
      // Create reply
      await Comment.create({
        book_id: bookId,
        page_id: currentPage.id,
        user_id: currentUser.id,
        content,
        parent_id: parentId
      });
      
      // Refresh comments
      await loadCommentsForCurrentPage();
      
      toast({
        description: "Reply added successfully."
      });
      
      return true;
    } catch (error) {
      console.error("Error adding reply:", error);
      toast({
        variant: "destructive",
        description: "Failed to add reply. Please try again."
      });
      return false;
    }
  };
  
  const handleResolveComment = async (commentId) => {
    try {
      await Comment.update(commentId, { resolved: true });
      
      // Refresh comments
      await loadCommentsForCurrentPage();
      
      toast({
        description: "Comment marked as resolved."
      });
    } catch (error) {
      console.error("Error resolving comment:", error);
      toast({
        variant: "destructive",
        description: "Failed to resolve comment. Please try again."
      });
    }
  };
  
  const handleInviteCollaborator = async (email, role) => {
    try {
      // Check if invitation already exists
      const existingInvites = await Collaboration.filter({
        book_id: bookId,
        collaborator_email: email
      });
      
      if (existingInvites.length > 0) {
        toast({
          variant: "destructive",
          description: "This person is already invited to collaborate."
        });
        return false;
      }
      
      // Create collaboration invitation
      await Collaboration.create({
        book_id: bookId,
        owner_id: currentUser.id,
        collaborator_email: email,
        role,
        status: "pending"
      });
      
      // Send email invitation
      try {
        await SendEmail({
          to: email,
          subject: `Invitation to collaborate on "${book.title}"`,
          body: `
            <p>Hello,</p>
            <p>${currentUser.full_name} has invited you to collaborate on a children's book titled "${book.title}" on EY.AI Kids Playground.</p>
            <p>You've been invited as a ${role === "editor" ? "co-editor" : "viewer"}.</p>
            <p>To accept this invitation, please log in to your account or sign up at <a href="https://app.base44.com/">EY.AI Kids Playground</a>.</p>
            <p>Happy storytelling!</p>
          `
        });
      } catch (error) {
        console.error("Error sending invitation email:", error);
      }
      
      // Refresh collaborators
      await refreshCollaborators();
      
      toast({
        description: `Invitation sent to ${email}.`
      });
      
      return true;
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        variant: "destructive",
        description: "Failed to send invitation. Please try again."
      });
      return false;
    }
  };
  
  const handleUpdateCollaboratorStatus = async (collaborationId, newStatus) => {
    try {
      await Collaboration.update(collaborationId, { status: newStatus });
      
      // Refresh collaborators
      await refreshCollaborators();
      
      toast({
        description: `Collaborator ${newStatus === "revoked" ? "removed" : newStatus}.`
      });
    } catch (error) {
      console.error("Error updating collaborator status:", error);
      toast({
        variant: "destructive",
        description: "Failed to update collaboration status. Please try again."
      });
    }
  };
  
  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      // Save current page before moving
      handleSavePage();
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      // Save current page before moving
      handleSavePage();
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Library"))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {book?.title || "Collaborative Editor"}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Badge variant="outline" className="text-xs">
                {bookStatus === "being-edited" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                {bookStatus === "being-edited" ? "Being Edited" : "Completed"}
              </Badge>
              <span className="text-sm">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              
              {collaborators.length > 0 && (
                <div className="flex -space-x-2 ml-2">
                  {collaborators.slice(0, 3).map((collab, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                      <AvatarImage 
                        src={collab.user?.full_name ? 
                          `https://ui-avatars.com/api/?name=${collab.user.full_name}&background=random` : 
                          undefined
                        } 
                      />
                      <AvatarFallback className="text-xs">
                        {collab.user?.full_name?.[0] || collab.collaborator_email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {collaborators.length > 3 && (
                    <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700">
                      <AvatarFallback className="text-xs text-gray-600 dark:text-gray-300">
                        +{collaborators.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isOwner && (
            <Button 
              variant="outline" 
              onClick={() => setInviteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite</span>
            </Button>
          )}
          <Button
            onClick={handleSavePage}
            disabled={isSaving || editorContent === currentPage?.text_content}
            className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {isSaving ? 
              <RotateCw className="h-4 w-4 animate-spin" /> : 
              <Save className="h-4 w-4" />
            }
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
              {comments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {comments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revisions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Collaborators</span>
              {collaborators.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {collaborators.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
        
        <TabsContent value="editor" className="flex-1">
          <CollaborativeEditor
            content={editorContent}
            onChange={setEditorContent}
            onSave={handleSavePage}
            isSaving={isSaving}
            currentPage={currentPage}
            onAddComment={(content) => {
              setActiveTab("comments");
              handleAddComment(content);
            }}
          />
        </TabsContent>
        
        <TabsContent value="comments">
          <PageComments 
            comments={comments}
            onAddComment={handleAddComment}
            onReplyToComment={handleReplyToComment}
            onResolveComment={handleResolveComment}
            currentUser={currentUser}
          />
        </TabsContent>
        
        <TabsContent value="revisions">
          <RevisionHistory 
            revisions={revisions} 
            currentPage={currentPage}
          />
        </TabsContent>
        
        <TabsContent value="collaborators">
          <CollaboratorsList 
            collaborators={collaborators}
            isOwner={isOwner}
            onInvite={() => setInviteDialogOpen(true)}
            onUpdateStatus={handleUpdateCollaboratorStatus}
            book={book}
            currentUser={currentUser}
          />
        </TabsContent>
      </Tabs>
      
      {/* Invite Collaborator Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Collaborators</DialogTitle>
            <DialogDescription>
              Invite others to collaborate on "{book?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <CollaborationInviteForm 
            onInvite={handleInviteCollaborator}
            onCancel={() => setInviteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
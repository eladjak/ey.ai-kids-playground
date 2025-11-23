import React, { useState, useEffect, useRef } from 'react';
import { Book } from "@/entities/Book";
import { Page } from "@/entities/Page";
import { Collaboration } from "@/entities/Collaboration";
import { Comment } from "@/entities/Comment";
import { Revision } from "@/entities/Revision";
import { User } from "@/entities/User";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  History, 
  Send, 
  UserPlus, 
  Save, 
  BookOpen,
  PlusCircle,
  Trash2,
  Eye,
  Pencil,
  Clock,
  User as UserIcon,
  CircleCheck,
  X,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CollaborativeWorkspace({ bookId }) {
  const { toast } = useToast();
  const [book, setBook] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedLayout, setEditedLayout] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("");
  const [newCollaboratorRole, setNewCollaboratorRole] = useState("editor");
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("english");
  const [isRTL, setIsRTL] = useState(false);
  const commentAreaRef = useRef(null);
  
  // Load language on component mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem("appLanguage") || "english";
    setCurrentLanguage(storedLanguage);
    setIsRTL(storedLanguage === "hebrew" || storedLanguage === "yiddish");
    
    const handleLanguageChange = (e) => {
      const newLang = e.detail?.language || "english";
      setCurrentLanguage(newLang);
      setIsRTL(newLang === "hebrew" || newLang === "yiddish");
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  // Translation function
  const t = (englishText, hebrewText) => {
    if (currentLanguage === "hebrew") return hebrewText;
    return englishText;
  };
  
  // Load initial data
  useEffect(() => {
    if (!bookId) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load current user
        const userData = await User.me();
        setCurrentUser(userData);
        
        // Load book data
        const bookData = await Book.get(bookId);
        setBook(bookData);
        
        // Check if user is owner
        setIsOwner(bookData.created_by === userData.email);
        
        // Load pages
        const pagesData = await Page.filter({ book_id: bookId }, "page_number");
        setPages(pagesData);
        
        if (pagesData.length > 0) {
          setSelectedPageId(pagesData[0].id);
          setCurrentPage(pagesData[0]);
          setEditedContent(pagesData[0].text_content || "");
          setEditedLayout(pagesData[0].layout_type || "text_top");
          
          // Load comments for first page
          loadComments(pagesData[0].id);
        }
        
        // Load collaborators
        loadCollaborators();
        
        // Load revision history
        loadRevisions();
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          variant: "destructive",
          description: t("Failed to load book data", "טעינת נתוני הספר נכשלה")
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [bookId]);
  
  // Load comments for selected page
  const loadComments = async (pageId) => {
    try {
      const commentsData = await Comment.filter({ page_id: pageId }, "-created_date");
      setComments(commentsData);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };
  
  // Load collaborators
  const loadCollaborators = async () => {
    try {
      const collaboratorsData = await Collaboration.filter({ book_id: bookId });
      setCollaborators(collaboratorsData);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };
  
  // Load revision history
  const loadRevisions = async () => {
    try {
      const revisionsData = await Revision.filter({ book_id: bookId }, "-created_date");
      setRevisions(revisionsData);
    } catch (error) {
      console.error("Error loading revisions:", error);
    }
  };
  
  // Handle page selection
  const handlePageSelect = (pageId) => {
    if (editMode) {
      if (window.confirm(t(
        "You have unsaved changes. Discard them?", 
        "יש לך שינויים שלא נשמרו. לזרוק אותם?"
      ))) {
        selectPage(pageId);
      }
    } else {
      selectPage(pageId);
    }
  };
  
  const selectPage = (pageId) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setSelectedPageId(pageId);
      setCurrentPage(page);
      setEditedContent(page.text_content || "");
      setEditedLayout(page.layout_type || "text_top");
      setEditMode(false);
      
      // Load comments for the selected page
      loadComments(pageId);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Discard changes
      setEditedContent(currentPage.text_content || "");
      setEditedLayout(currentPage.layout_type || "text_top");
    }
    setEditMode(!editMode);
  };
  
  // Save edited page
  const savePageChanges = async () => {
    if (!currentPage) return;
    
    try {
      setIsSaving(true);
      
      // Save previous content for revision history
      await Revision.create({
        book_id: bookId,
        page_id: currentPage.id,
        user_id: currentUser.id,
        content_type: "text",
        previous_value: currentPage.text_content || "",
        new_value: editedContent,
        field_name: "text_content"
      });
      
      // Update page
      await Page.update(currentPage.id, {
        text_content: editedContent,
        layout_type: editedLayout
      });
      
      // Refresh page data
      const updatedPage = await Page.get(currentPage.id);
      setCurrentPage(updatedPage);
      
      // Update pages array
      setPages(prev => prev.map(p => 
        p.id === updatedPage.id ? updatedPage : p
      ));
      
      // Exit edit mode
      setEditMode(false);
      
      // Refresh revision history
      loadRevisions();
      
      toast({
        description: t("Page updated successfully", "העמוד עודכן בהצלחה"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      console.error("Error saving page:", error);
      toast({
        variant: "destructive",
        description: t("Failed to update page", "עדכון העמוד נכשל")
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Add a new comment
  const addComment = async () => {
    if (!newComment.trim() || !currentPage) return;
    
    try {
      const commentData = {
        page_id: currentPage.id,
        book_id: bookId,
        user_id: currentUser.id,
        content: newComment
      };
      
      const createdComment = await Comment.create(commentData);
      
      // Refresh comments
      setComments(prev => [createdComment, ...prev]);
      
      // Clear input
      setNewComment("");
      
      // Scroll to new comment
      if (commentAreaRef.current) {
        commentAreaRef.current.scrollTop = 0;
      }
      
      toast({
        description: t("Comment added", "התגובה נוספה"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        variant: "destructive",
        description: t("Failed to add comment", "הוספת התגובה נכשלה")
      });
    }
  };
  
  // Invite a collaborator
  const inviteCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;
    
    try {
      const collaborationData = {
        book_id: bookId,
        owner_id: currentUser.id,
        collaborator_email: newCollaboratorEmail,
        role: newCollaboratorRole,
        status: "pending"
      };
      
      await Collaboration.create(collaborationData);
      
      // Refresh collaborators
      loadCollaborators();
      
      // Clear input
      setNewCollaboratorEmail("");
      
      toast({
        description: t("Invitation sent", "ההזמנה נשלחה"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      toast({
        variant: "destructive",
        description: t("Failed to send invitation", "שליחת ההזמנה נכשלה")
      });
    }
  };
  
  // Remove a collaborator
  const removeCollaborator = async (collaborationId) => {
    try {
      await Collaboration.update(collaborationId, { status: "revoked" });
      
      // Refresh collaborators
      loadCollaborators();
      
      toast({
        description: t("Collaborator removed", "המשתף הוסר"),
        className: "bg-green-100 text-green-900 dark:bg-green-900/50 dark:text-green-100"
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        variant: "destructive",
        description: t("Failed to remove collaborator", "הסרת המשתף נכשלה")
      });
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    return format(date, "PPp");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            {t("Loading collaborative workspace...", "טוען סביבת עבודה משותפת...")}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-500" />
            {t("Collaborative Workspace", "סביבת עבודה משותפת")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {book?.title}
          </p>
        </div>
        
        <Link to={`${createPageUrl("BookView")}?id=${bookId}`} target="_blank">
          <Button variant="outline" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t("Preview Book", "תצוגה מקדימה של הספר")}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Page selection */}
        <div className="col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {t("Pages", "עמודים")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <div className="space-y-1">
                {pages.map((page) => (
                  <Button
                    key={page.id}
                    variant={selectedPageId === page.id ? "secondary" : "ghost"}
                    className={`w-full justify-start ${isRTL ? "text-right" : "text-left"}`}
                    onClick={() => handlePageSelect(page.id)}
                  >
                    {t("Page", "עמוד")} {page.page_number === 0 ? t("Cover", "כריכה") : page.page_number}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {currentPage ? (
                  t(`Page ${currentPage.page_number === 0 ? 'Cover' : currentPage.page_number}`, 
                     `עמוד ${currentPage.page_number === 0 ? 'כריכה' : currentPage.page_number}`)
                ) : (
                  t("Page Content", "תוכן העמוד")
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {currentPage && (
                  <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleEditMode}
                    className={editMode ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {editMode ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        {t("Cancel", "ביטול")}
                      </>
                    ) : (
                      <>
                        <Pencil className="h-4 w-4 mr-1" />
                        {t("Edit", "עריכה")}
                      </>
                    )}
                  </Button>
                )}
                
                {editMode && (
                  <Button
                    onClick={savePageChanges}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-r-transparent animate-spin mr-1"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {t("Save", "שמירה")}
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="px-4 flex-grow">
              {currentPage ? (
                <div className="h-full">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          {t("Layout Type", "סוג פריסה")}
                        </label>
                        <Select value={editedLayout} onValueChange={setEditedLayout}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select layout", "בחר פריסה")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text_top">{t("Text Top", "טקסט למעלה")}</SelectItem>
                            <SelectItem value="text_bottom">{t("Text Bottom", "טקסט למטה")}</SelectItem>
                            <SelectItem value="text_left">{t("Text Left", "טקסט משמאל")}</SelectItem>
                            <SelectItem value="text_right">{t("Text Right", "טקסט מימין")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          {t("Page Content", "תוכן העמוד")}
                        </label>
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          placeholder={t("Enter page content here...", "הכנס תוכן עמוד כאן...")}
                          className={`min-h-[300px] ${isRTL ? "text-right" : "text-left"}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg min-h-[300px]">
                      {currentPage.image_url && (
                        <div className="mb-4">
                          <img 
                            src={currentPage.image_url} 
                            alt={`Page ${currentPage.page_number}`}
                            className="w-full h-auto max-h-[200px] object-contain rounded-lg"
                          />
                        </div>
                      )}
                      
                      <div className={`prose dark:prose-invert max-w-none ${isRTL ? "text-right" : "text-left"}`}>
                        {currentPage.text_content ? (
                          <p className="whitespace-pre-wrap">{currentPage.text_content}</p>
                        ) : (
                          <p className="text-gray-500 italic">
                            {t("No content yet for this page.", "אין עדיין תוכן לעמוד זה.")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <BookOpen className="h-12 w-12 mb-4 text-gray-300" />
                  <p>{t("Select a page to view its content", "בחר עמוד כדי לצפות בתוכנו")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right sidebar - Collaboration tools */}
        <div className="col-span-1">
          <Tabs defaultValue="comments">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="comments" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Comments", "תגובות")}</span>
              </TabsTrigger>
              <TabsTrigger value="collaborators" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Team", "צוות")}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">{t("History", "היסטוריה")}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments">
              <Card className="border-t-0 rounded-tl-none rounded-tr-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {t("Comments", "תגובות")}
                  </CardTitle>
                  <CardDescription>
                    {currentPage 
                      ? t("Comments for this page", "תגובות לעמוד זה")
                      : t("Select a page to view comments", "בחר עמוד כדי לצפות בתגובות")}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {currentPage && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {currentUser?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder={t("Add a comment...", "הוסף תגובה...")}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className={isRTL ? "text-right" : "text-left"}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                addComment();
                              }
                            }}
                          />
                          <Button 
                            onClick={addComment}
                            disabled={!newComment.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                            size="icon"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div 
                        className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
                        ref={commentAreaRef}
                      >
                        {comments.length > 0 ? (
                          comments.map((comment) => (
                            <div key={comment.id} className="relative">
                              <div className={`flex gap-3 ${isRTL ? "text-right" : "text-left"}`}>
                                <Avatar className="h-8 w-8 mt-1">
                                  <AvatarFallback>
                                    {comment.user_id?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {comment.created_by?.split("@")[0] || t("User", "משתמש")}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTimestamp(comment.created_date)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                              <Separator className="mt-4" />
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>{t("No comments yet", "אין תגובות עדיין")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="collaborators">
              <Card className="border-t-0 rounded-tl-none rounded-tr-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {t("Collaborators", "משתפי פעולה")}
                  </CardTitle>
                  <CardDescription>
                    {t("Team working on this book", "צוות העובד על ספר זה")}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {isOwner && (
                      <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                        <h3 className="text-sm font-medium">
                          {t("Invite a collaborator", "הזמן משתף פעולה")}
                        </h3>
                        <div className="flex flex-col gap-2">
                          <Input 
                            placeholder={t("Email address", "כתובת אימייל")}
                            value={newCollaboratorEmail}
                            onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                          />
                          <Select value={newCollaboratorRole} onValueChange={setNewCollaboratorRole}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select role", "בחר תפקיד")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">{t("Editor", "עורך")}</SelectItem>
                              <SelectItem value="viewer">{t("Viewer", "צופה")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={inviteCollaborator}
                            disabled={!newCollaboratorEmail.trim()}
                            className="bg-purple-600 hover:bg-purple-700 w-full"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {t("Send Invitation", "שלח הזמנה")}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">
                        {t("Current Collaborators", "משתפי פעולה נוכחיים")}
                      </h3>
                      
                      <div className="space-y-2">
                        {/* Owner */}
                        <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-200 text-purple-700">
                                {book?.created_by?.charAt(0) || "O"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {book?.created_by?.split("@")[0] || t("Owner", "בעלים")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t("Owner", "בעלים")}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200 rounded-full">
                            {t("Owner", "בעלים")}
                          </span>
                        </div>
                        
                        {/* Collaborators */}
                        {collaborators.filter(c => c.status === "accepted").length > 0 ? (
                          collaborators
                            .filter(c => c.status === "accepted")
                            .map((collab) => (
                              <div key={collab.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {collab.collaborator_email?.charAt(0) || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                      {collab.collaborator_email?.split("@")[0] || t("Collaborator", "משתף")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {collab.collaborator_email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    collab.role === "editor"
                                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                  }`}>
                                    {collab.role === "editor" ? t("Editor", "עורך") : t("Viewer", "צופה")}
                                  </span>
                                  
                                  {isOwner && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeCollaborator(collab.id)}
                                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>{t("No active collaborators", "אין משתפי פעולה פעילים")}</p>
                            {isOwner && (
                              <p className="text-sm mt-1">
                                {t("Invite someone to collaborate", "הזמן מישהו לשתף פעולה")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Pending invitations */}
                    {isOwner && collaborators.filter(c => c.status === "pending").length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium">
                          {t("Pending Invitations", "הזמנות ממתינות")}
                        </h3>
                        
                        <div className="space-y-2">
                          {collaborators
                            .filter(c => c.status === "pending")
                            .map((collab) => (
                              <div key={collab.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-yellow-200 text-yellow-700">
                                      {collab.collaborator_email?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                      {collab.collaborator_email?.split("@")[0] || t("Invited", "מוזמן")}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {collab.collaborator_email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-full">
                                    {t("Pending", "ממתין")}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCollaborator(collab.id)}
                                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="border-t-0 rounded-tl-none rounded-tr-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {t("Revision History", "היסטוריית שינויים")}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {revisions.length > 0 ? (
                      revisions.map((revision) => {
                        const pageName = pages.find(p => p.id === revision.page_id)?.page_number;
                        const pageTitle = pageName !== undefined 
                          ? t(`Page ${pageName === 0 ? 'Cover' : pageName}`, `עמוד ${pageName === 0 ? 'כריכה' : pageName}`)
                          : t("Unknown page", "עמוד לא ידוע");
                          
                        return (
                          <div key={revision.id} className="relative">
                            <div className={`flex gap-3 ${isRTL ? "text-right" : "text-left"}`}>
                              <div className="flex-none">
                                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
                                  <Clock className="h-4 w-4" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {pageTitle} - {t("Updated", "עודכן")}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(revision.created_date)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {t("Updated by", "עודכן על ידי")}: {revision.created_by?.split("@")[0] || t("User", "משתמש")}
                                </p>
                                {revision.content_type === "text" && (
                                  <div className="mt-2 text-sm">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md mb-1 text-red-800 dark:text-red-200 line-clamp-2">
                                      <span className="font-medium">{t("Removed", "הוסר")}:</span> {revision.previous_value || t("Empty", "ריק")}
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md text-green-800 dark:text-green-200 line-clamp-2">
                                      <span className="font-medium">{t("Added", "נוסף")}:</span> {revision.new_value || t("Empty", "ריק")}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Separator className="mt-4" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>{t("No revision history yet", "אין היסטוריית שינויים עדיין")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
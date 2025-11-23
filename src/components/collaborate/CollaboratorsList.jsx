import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  UserPlus, 
  UserCog, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban,
  UserX,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CollaboratorsList({ 
  collaborators, 
  isOwner, 
  onInvite, 
  onUpdateStatus,
  book,
  currentUser
}) {
  const pendingInvitations = collaborators.filter(c => c.status === "pending");
  const activeCollaborators = collaborators.filter(c => c.status === "accepted");
  
  // Group collaborators by status for better display
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800">
            <Ban className="h-3 w-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case "editor":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
            <UserCog className="h-3 w-3 mr-1" />
            Editor
          </Badge>
        );
      case "viewer":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Eye className="h-3 w-3 mr-1" />
            Viewer
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-600" />
            Active Collaborators
          </CardTitle>
          <CardDescription>
            People currently collaborating on this book
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeCollaborators.length > 0 ? (
            <ul className="space-y-4">
              {/* Book Owner */}
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${book.created_by.split('@')[0]}&background=random`} />
                    <AvatarFallback>{book.created_by[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{book.created_by.split('@')[0]}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{book.created_by}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    Owner
                  </Badge>
                </div>
              </li>
              
              {/* Active Collaborators */}
              {activeCollaborators.map((collab, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={collab.user?.full_name ? 
                        `https://ui-avatars.com/api/?name=${collab.user.full_name}&background=random` : 
                        undefined
                      } />
                      <AvatarFallback>
                        {collab.user?.full_name?.[0] || collab.collaborator_email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {collab.user?.full_name || collab.collaborator_email.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {collab.collaborator_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(collab.role)}
                    
                    {isOwner && collab.collaborator_email !== currentUser.email && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            className="text-red-600 dark:text-red-400"
                            onClick={() => onUpdateStatus(collab.id, "revoked")}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remove Collaborator
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No active collaborators yet
              </p>
              {isOwner && (
                <Button 
                  onClick={onInvite}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Collaborators
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              Invitations waiting for response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {pendingInvitations.map((collab, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {collab.collaborator_email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {collab.collaborator_email.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {collab.collaborator_email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(collab.status)}
                    {getRoleBadge(collab.role)}
                    
                    {isOwner && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => onUpdateStatus(collab.id, "revoked")}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {isOwner && (
        <div className="flex justify-center">
          <Button 
            onClick={onInvite}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite New Collaborator
          </Button>
        </div>
      )}
    </div>
  );
}
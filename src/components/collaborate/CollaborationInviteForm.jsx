import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogFooter } from "@/components/ui/dialog";

export default function CollaborationInviteForm({ onInvite, onCancel }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleSubmit = async () => {
    // Reset error
    setError("");
    
    // Validate email
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Send invitation
    const success = await onInvite(email, role);
    
    if (success) {
      // Clear form
      setEmail("");
      setRole("editor");
      
      // Close dialog
      onCancel();
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Invite via email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Permission level</Label>
        <RadioGroup value={role} onValueChange={setRole} className="flex flex-col space-y-1">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="editor" id="editor" className="mt-1" />
            <div>
              <Label htmlFor="editor" className="font-medium">Editor</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can edit text, add comments, and see revision history
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="viewer" id="viewer" className="mt-1" />
            <div>
              <Label htmlFor="viewer" className="font-medium">Viewer</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can view the book and add comments only
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <DialogFooter className="mt-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Sending..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X, Bot, Loader2, Plus, MessageSquare, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  chatWithAI, 
  getChatSessions, 
  getChatSession,
  deleteChatSession,
  updateChatSessionTitle,
  getSmartSuggestions, 
  getAIStatus 
} from "@/lib/aiAPI";
import type { ChatSession } from "@/lib/aiAPI";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistant = ({ isOpen, onClose }: AIAssistantProps) => {
  const [input, setInput] = useState("");
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAPI, setHasAPI] = useState(false);
  const [apiProvider, setApiProvider] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages, isLoading]);

  // Load initial data when component opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      // Check AI status
      const statusResponse = await getAIStatus();
      if (statusResponse.success) {
        setHasAPI(statusResponse.hasAPI || false);
        setApiProvider(statusResponse.provider || null);
      }

      // Load chat sessions
      const sessionsResponse = await getChatSessions();
      if (sessionsResponse.success && sessionsResponse.sessions) {
        setSessions(sessionsResponse.sessions);
      }

      // Load smart suggestions if no current session
      if (!currentSession) {
        const suggestionsResponse = await getSmartSuggestions();
        if (suggestionsResponse.success && suggestionsResponse.suggestions) {
          setSuggestions(suggestionsResponse.suggestions);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content) return;
    
    setInput("");
    setIsLoading(true);
    
    try {
      if (!hasAPI) {
        console.error("No API available");
        return;
      }

      // Tạo temporary message để hiển thị ngay lập tức
      const userMessage = {
        _id: Date.now().toString(),
        type: 'user' as const,
        content,
        timestamp: new Date()
      };

      // Nếu chưa có session, tạo temporary session
      if (!currentSession) {
        const tempSession = {
          _id: 'temp-' + Date.now(),
          title: content.length > 50 ? content.substring(0, 47) + '...' : content,
          messages: [userMessage],
          lastMessageAt: new Date(),
          createdAt: new Date(),
          messageCount: 1
        };
        setCurrentSession(tempSession);
      } else {
        // Thêm user message vào session hiện tại
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, userMessage]
        } : null);
      }

      const response = await chatWithAI(content, currentSession?._id?.startsWith('temp-') ? undefined : currentSession?._id);
      
      if (response.success && response.session) {
        // Update current session with complete data from server
        setCurrentSession(response.session);
        
        // Refresh sessions list to update lastMessage and messageCount
        await loadChatSessions();
      } else {
        console.error('Chat error:', response.message);
        // Show error message in current session
        const errorMessage = {
          _id: (Date.now() + 1).toString(),
          type: 'assistant' as const,
          content: response.message || 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        };
        
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, errorMessage]
        } : null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message
      const errorMessage = {
        _id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: new Date()
      };
      
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatSessions = async () => {
    const sessionsResponse = await getChatSessions();
    if (sessionsResponse.success && sessionsResponse.sessions) {
      setSessions(sessionsResponse.sessions);
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      console.log('Loading chat session:', sessionId);
      const response = await getChatSession(sessionId);
      if (response.success && response.session) {
        console.log('Session loaded successfully:', response.session);
        setCurrentSession(response.session);
        setShowSessions(false);
      } else {
        console.error('Failed to load session:', response.message);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const handleNewChat = () => {
    setCurrentSession(null);
    setShowSessions(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await deleteChatSession(sessionId);
      if (response.success) {
        // Remove from sessions list
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        
        // If current session was deleted, clear it
        if (currentSession?._id === sessionId) {
          setCurrentSession(null);
        }
        
        console.log('Chat session deleted successfully');
      } else {
        console.error('Failed to delete session:', response.message);
        // Có thể thêm toast notification ở đây trong tương lai
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      // Có thể thêm toast notification ở đây trong tương lai
    }
  };

  const handleEditTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveTitle = async (sessionId: string) => {
    try {
      const response = await updateChatSessionTitle(sessionId, editingTitle);
      if (response.success) {
        // Update sessions list
        setSessions(prev => prev.map(s => 
          s._id === sessionId ? { ...s, title: editingTitle } : s
        ));
        
        // Update current session if it's the same
        if (currentSession?._id === sessionId) {
          setCurrentSession(prev => prev ? { ...prev, title: editingTitle } : null);
        }
      }
    } catch (error) {
      console.error('Error updating title:', error);
    } finally {
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-xs text-gray-500">
                {hasAPI 
                  ? `Powered by ${apiProvider?.toUpperCase() || 'AI'}`
                  : 'AI functionality not available'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Chat Controls */}
        <div className="flex gap-2">
          <Button
            variant={showSessions ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSessions(!showSessions)}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chats ({sessions.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Sessions List */}
      {showSessions && (
        <div className="border-b border-gray-200 max-h-60 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chat sessions yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className={`p-3 rounded-lg cursor-pointer group hover:bg-gray-50 ${
                    currentSession?._id === session._id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => loadChatSession(session._id)}
                >
                  <div className="flex items-center justify-between">
                    {editingSessionId === session._id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="text-sm h-6"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(session._id)}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveTitle(session._id)}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-xs text-gray-500">
                            {session.messageCount} messages
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleEditTitle(session._id, session.title, e)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteSession(session._id, e)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Welcome Message or Current Chat */}
      {!currentSession && !showSessions && (
        <>
          <div className="p-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Hi there!</h3>
              <p className="text-xl font-bold">How can I help you?</p>
              {!hasAPI && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Bot className="w-4 h-4 inline mr-1" />
                    AI features unavailable. Please configure API keys in backend.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Card 
                    key={index} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Messages */}
      {currentSession && !showSessions && (
        <>
          {/* Chat Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 truncate">{currentSession.title}</h3>
            <p className="text-xs text-gray-500">
              {currentSession.messages?.length || 0} messages
            </p>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-4">
              {currentSession.messages && currentSession.messages.length > 0 ? (
                currentSession.messages.map((message, index) => (
                  <div
                    key={message._id || message.id || index}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.timestamp && (
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
            </div>
          </div>

          {/* Input Area - Always at bottom */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder={hasAPI ? "Type your message..." : "AI unavailable"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage();
                  }
                }}
                className="flex-1"
                disabled={!hasAPI || isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()}
                size="sm"
                className="w-10 h-10 p-0"
                disabled={!hasAPI || isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Input for Welcome Screen only */}
      {!showSessions && !currentSession && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              placeholder={hasAPI ? "Ask something..." : "AI unavailable"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
              className="flex-1"
              disabled={!hasAPI || isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()}
              size="sm"
              className="w-10 h-10 p-0"
              disabled={!hasAPI || isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;

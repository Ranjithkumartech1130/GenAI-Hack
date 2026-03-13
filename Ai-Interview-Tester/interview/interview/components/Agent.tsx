"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";
import { createFeedback, generateAIResponse } from "@/lib/actions/general.action";
import { toast } from "sonner";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  role,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleUserResponse(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            toast.error("Speech recognition error. Please try again or type your response.");
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (synthesisRef.current) synthesisRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    synthesisRef.current.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && callStatus === CallStatus.ACTIVE) {
      if (synthesisRef.current?.speaking) synthesisRef.current.cancel();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting recognition", e);
      }
    }
  }, [isListening, callStatus]);

  const handleUserResponse = async (text: string) => {
    if (!text.trim()) return;
    setIsListening(false);
    if (recognitionRef.current) recognitionRef.current.stop();

    const userMessage: SavedMessage = { role: "user", content: text };
    setMessages((prev: SavedMessage[]) => [...prev, userMessage]);
    setTextInput("");

    setIsProcessing(true);
    try {
      const allMessages = [...messages, userMessage];
      const result = await generateAIResponse({
        messages: allMessages,
        questions: questions || [],
        role: role,
      });

      if (result.success && result.text) {
        const aiMessage: SavedMessage = { role: "assistant", content: result.text };
        setMessages((prev: SavedMessage[]) => [...prev, aiMessage]);
        speak(result.text);
      } else {
        toast.error("Failed to get AI response.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing response.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartInterview = async () => {
    setCallStatus(CallStatus.ACTIVE);
    const initialGreeting = `Hello ${userName}, I'm ready to begin your ${role} interview. ${questions && questions.length > 0
        ? `Let's start with the first question: ${questions[0]} QIDX:0`
        : "Tell me about yourself."
      }`;
    const aiMessage: SavedMessage = { role: "assistant", content: initialGreeting };
    setMessages([aiMessage]);
    speak(initialGreeting);
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    if (synthesisRef.current) synthesisRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();

    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
      feedbackId,
    });

    if (success && id) {
      router.push(`/root/interview/${interviewId}/feedback`);
    } else {
      toast.error("Error saving feedback");
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full mt-4">
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>{type === 'HR Round' ? 'AI HR Manager' : 'AI Interviewer'}</h3>
          {isProcessing && <p className="text-xs text-primary-200 animate-pulse mt-2">Thinking...</p>}
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px]"
            />
            <div className="flex flex-col items-center gap-2 mt-4">
              <h3>{userName}</h3>
              {isListening && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />}
            </div>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border max-h-[300px] overflow-y-auto w-full">
          <div className="transcript flex flex-col gap-4 !bg-transparent !p-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl max-w-[85%] transition-all animate-fadeIn",
                msg.role === 'assistant' ? "bg-dark-300 self-start text-primary-100" : "bg-primary-200 self-end text-dark-800"
              )}>
                <p className="text-sm !text-inherit">{msg.content}</p>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      <div className="w-full flex flex-col items-center gap-6">
        {callStatus === CallStatus.INACTIVE ? (
          <button className="relative btn-call flex items-center gap-2" onClick={handleStartInterview}>
            <Image src="/logo.svg" alt="logo" width={20} height={20} className="brightness-200" />
            <span className="relative">Start Mock Interview</span>
          </button>
        ) : callStatus === CallStatus.ACTIVE ? (
          <div className="flex flex-col gap-6 w-full max-w-2xl px-4">
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserResponse(textInput)}
                placeholder="Type your answer here..."
                className="flex-1 bg-dark-200 border border-primary-100/20 rounded-full px-6 py-4 text-white outline-none focus:border-primary-200 transition-all placeholder:text-light-400"
              />
              <button
                onClick={() => handleUserResponse(textInput)}
                disabled={!textInput.trim() || isProcessing}
                className="bg-primary-200 text-dark-100 px-8 py-4 rounded-full font-bold hover:bg-primary-200/90 transition-all disabled:opacity-50 shadow-lg"
              >
                Send
              </button>
            </div>

            <div className="flex justify-center gap-4">
              <button
                className={cn(
                  "px-8 py-4 rounded-full font-bold transition-all flex items-center gap-3 border shadow-md",
                  isListening ? "bg-red-500 text-white animate-pulse" : "bg-dark-200 text-primary-200 border-primary-200"
                )}
                onClick={() => isListening ? recognitionRef.current?.stop() : startListening()}
                disabled={isSpeaking || isProcessing}
              >
                {isListening ? "Listening..." : (
                  <>
                    <Mic size={18} />
                    Speak My Answer
                  </>
                )}
              </button>
              <button className="btn-disconnect !px-8" onClick={handleDisconnect}>
                End Interview
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
            <p className="text-primary-200 font-medium animate-pulse">Analyzing and generating feedback...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agent;

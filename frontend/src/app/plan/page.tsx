'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { generateMockTrip } from '@/lib/trip-generator'
import { addNewTrip, addNewActivities } from '@/lib/mock-data'
import { 
  ChatContainerRoot, 
  ChatContainerContent, 
  ChatContainerScrollAnchor 
} from '@/components/ui/chat-container'
import { 
  Message, 
  MessageAvatar, 
  MessageContent 
} from '@/components/ui/message'
import { 
  PromptInput, 
  PromptInputTextarea,
  PromptInputActions 
} from '@/components/ui/prompt-input'
import { PromptSuggestion } from '@/components/ui/prompt-suggestion'
import { Loader } from '@/components/ui/loader'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PlanningState {
  step: 'initial' | 'destination' | 'duration' | 'activities' | 'generating'
  responses: {
    destination?: string
    duration?: string
    activities?: string
    tripId?: string
  }
}

// Quick response options for each step
const DESTINATION_OPTIONS = [
  'Tokyo, Japan',
  'Paris, France', 
  'London, England',
  'New York, USA',
  'Rome, Italy',
  'Barcelona, Spain'
]

const DURATION_OPTIONS = [
  'Weekend (2-3 days)',
  '1 Week',
  '10 Days',
  '2 Weeks',
  'Flexible'
]

const ACTIVITY_OPTIONS = [
  'Food & Culture',
  'Museums & History',
  'Adventure & Outdoors',
  'Nightlife & Entertainment',
  'Shopping & Relaxation',
  'Mix of Everything'
]

export default function PlanPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [planningState, setPlanningState] = useState<PlanningState>({
    step: 'initial',
    responses: {}
  })
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    
    // Delay scroll to allow animations to start
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  const getCurrentSuggestions = () => {
    // Only show suggestions after conversation has started
    if (!hasStarted) return []
    
    switch (planningState.step) {
      case 'destination':
        return DESTINATION_OPTIONS
      case 'duration': 
        return DURATION_OPTIONS
      case 'activities':
        return ACTIVITY_OPTIONS
      default:
        return []
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    // Auto-submit the suggestion
    setTimeout(() => handleSendMessage(suggestion), 100)
  }

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim()
    if (!content || isLoading) return

    // Mark conversation as started
    if (!hasStarted) {
      setHasStarted(true)
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate AI processing delay
    setTimeout(() => {
      let assistantMessage: ChatMessage
      let nextPlanningState = { ...planningState }

      switch (planningState.step) {
        case 'initial':
          // First message - ask about destination
          nextPlanningState.step = 'destination'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Hi! I'm here to help you plan your perfect trip. Let's start with the basics - where would you like to go?`,
            timestamp: new Date()
          }
          break

        case 'destination':
          // Store destination and ask about duration
          nextPlanningState.responses.destination = content
          nextPlanningState.step = 'duration'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Great choice! **${content}** sounds amazing! 🌟\n\nHow long would you like to stay?`,
            timestamp: new Date()
          }
          break

        case 'duration':
          // Store duration and ask about activities
          nextPlanningState.responses.duration = content
          nextPlanningState.step = 'activities'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Perfect! **${content}** in ${nextPlanningState.responses.destination} will be wonderful! ✈️\n\nWhat kind of activities interest you most?`,
            timestamp: new Date()
          }
          break

        case 'activities':
          // Store activities and start trip generation
          nextPlanningState.responses.activities = content
          nextPlanningState.step = 'generating'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Excellent! I now have everything I need to create your perfect trip:\n\n📍 **Destination:** ${nextPlanningState.responses.destination}\n⏰ **Duration:** ${nextPlanningState.responses.duration}\n🎯 **Interests:** ${content}\n\nLet me create a personalized itinerary with flights, hotels, activities, and more. This will just take a moment...`,
            timestamp: new Date()
          }
          
          // Generate trip after showing this message
          setTimeout(() => {
            generateTripFromResponses(nextPlanningState.responses)
          }, 2000)
          break

        default:
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "I'm still processing your previous request. Please wait a moment.",
            timestamp: new Date()
          }
      }

      setMessages(prev => [...prev, assistantMessage])
      setPlanningState(nextPlanningState)
      setIsLoading(false)
    }, 1000)
  }

  const generateTripFromResponses = (responses: PlanningState['responses']) => {
    setIsLoading(true)
    
    try {
      // Create a comprehensive prompt from the collected responses
      const fullPrompt = `Trip to ${responses.destination} for ${responses.duration}, interested in ${responses.activities}`
      const { trip, activities } = generateMockTrip(fullPrompt)
      
      // Update trip name to be more personalized
      const personalizedTrip = {
        ...trip,
        name: `${responses.destination} Adventure`
      }
      
      // Add trip and activities to mock data
      addNewTrip(personalizedTrip)
      addNewActivities(activities)
      
      // Final success message
      const successMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `🎉 **Trip Created Successfully!**\n\nI've created your **"${personalizedTrip.name}"** itinerary with **${activities.length} activities** perfectly tailored to your interests!\n\n✅ **What's included:**\n• Flights and accommodations\n• Daily activities and experiences\n• Restaurant recommendations\n• Transportation between venues\n\n📋 **Next steps:**\n• Review all planned activities\n• Customize any details\n• Book activities when you're ready\n\nMost activities are marked as "planned" so you have full control over your bookings!\n\nClick the button below to view your trip timeline.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, successMessage])
      
      // Store trip ID for the view button
      setPlanningState(prev => ({ 
        ...prev, 
        responses: { 
          ...prev.responses, 
          tripId: personalizedTrip.id 
        } 
      }))
      
    } catch (error) {
      console.error('Error generating trip:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "❌ I encountered an issue creating your trip. Please refresh the page and try again.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Chat Interface */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-[calc(100vh-7rem)] flex flex-col">
          
          {/* Chat Messages with prompt-kit ChatContainer */}
          <ChatContainerRoot className="flex-1 p-6">
            <ChatContainerContent className="space-y-4">
              {/* Empty state when no messages */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6"
                >
                  {/* Tripmind Logo */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Ready to plan your adventure?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Tell me about your dream destination and I'll create a personalized itinerary for you
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Messages with animations */}
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      layout: { duration: 0.2 }
                    }}
                  >
                    <Message
                      className={`${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <MessageAvatar
                          src="/ai-avatar.png"
                          alt="AI Assistant"
                          fallback="AI"
                          className="bg-blue-100 dark:bg-blue-900"
                        />
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <MessageContent
                          markdown={message.role === 'assistant'}
                          className={`${
                            message.role === 'user'
                              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 ml-auto'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          {message.content}
                        </MessageContent>
                        <div className={`text-xs mt-1 px-2 opacity-70 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {message.role === 'user' && (
                        <MessageAvatar
                          src="/user-avatar.png"
                          alt="You"
                          fallback="U"
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                      )}
                    </Message>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Loading message with prompt-kit Loader */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Message className="justify-start">
                    <MessageAvatar
                      src="/ai-avatar.png"
                      alt="AI Assistant"
                      fallback="AI"
                      className="bg-blue-100 dark:bg-blue-900"
                    />
                    <MessageContent className="bg-gray-100 dark:bg-gray-800">
                      <div className="flex items-center space-x-2">
                        <Loader variant="dots" size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Thinking...
                        </span>
                      </div>
                    </MessageContent>
                  </Message>
                </motion.div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
              <ChatContainerScrollAnchor />
            </ChatContainerContent>
          </ChatContainerRoot>

          {/* Enhanced Input Section with Quick Response Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
            
            {/* View Trip Button (shown after trip is created) */}
            {planningState.step === 'generating' && planningState.responses.tripId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <button
                  onClick={() => router.push(`/trip/${planningState.responses.tripId}/timeline`)}
                  className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                >
                  View Your Trip Timeline →
                </button>
              </motion.div>
            )}
            
            {/* Quick Response Buttons with stagger animation */}
            <AnimatePresence>
              {getCurrentSuggestions().length > 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    Quick responses:
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                    className="flex flex-wrap gap-2"
                  >
                    {getCurrentSuggestions().map((suggestion) => (
                      <motion.div
                        key={suggestion}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8, y: 10 },
                          visible: { opacity: 1, scale: 1, y: 0 }
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <PromptSuggestion
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-sm"
                          variant="outline"
                          size="sm"
                        >
                          {suggestion}
                        </PromptSuggestion>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Prompt Input */}
            <PromptInput
              value={inputValue}
              onValueChange={setInputValue}
              onSubmit={() => handleSendMessage()}
              disabled={isLoading}
              className="min-h-[60px]"
            >
              <PromptInputTextarea
                placeholder={
                  !hasStarted
                    ? "Describe your dream trip... (e.g., I want to visit Tokyo for a week)"
                    : planningState.step === 'destination' 
                    ? "Where would you like to go? (e.g., Tokyo, Paris, New York...)"
                    : planningState.step === 'duration'
                    ? "How long would you like to stay? (e.g., 3 days, a week, 10 days...)"
                    : planningState.step === 'activities'
                    ? "What activities interest you? (e.g., food and culture, museums, nightlife...)"
                    : "Tell me about your travel preferences..."
                }
              />
              <PromptInputActions />
            </PromptInput>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Press Enter to send, Shift+Enter for new line, or click a suggestion above
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateMockTrip } from '@/lib/trip-generator'
import { addNewTrip, addNewActivities } from '@/lib/mock-data'

interface Message {
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
  }
}

export default function PlanPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm here to help you plan your perfect trip. Let's start with the basics - where would you like to go? (e.g., Tokyo, Paris, New York, Rome, etc.)",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [planningState, setPlanningState] = useState<PlanningState>({
    step: 'initial',
    responses: {}
  })
  const router = useRouter()

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    const userResponse = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Simulate AI processing delay
    setTimeout(() => {
      let assistantMessage: Message
      let nextPlanningState = { ...planningState }

      switch (planningState.step) {
        case 'initial':
          // Store destination and ask about duration
          nextPlanningState.responses.destination = userResponse
          nextPlanningState.step = 'destination'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Great choice! ${userResponse} sounds amazing! How long would you like to stay? (e.g., "3 days", "a week", "10 days", etc.)`,
            timestamp: new Date()
          }
          break

        case 'destination':
          // Store duration and ask about activities
          nextPlanningState.responses.duration = userResponse  
          nextPlanningState.step = 'duration'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Perfect! ${userResponse} in ${nextPlanningState.responses.destination} will be wonderful! What kind of activities interest you most? (e.g., "food and culture", "museums and sightseeing", "nightlife and shopping", "outdoor adventures", etc.)`,
            timestamp: new Date()
          }
          break

        case 'duration':
          // Store activities and start trip generation
          nextPlanningState.responses.activities = userResponse
          nextPlanningState.step = 'activities'
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Excellent! I now have everything I need to create your perfect trip:\n\n📍 **Destination:** ${nextPlanningState.responses.destination}\n⏰ **Duration:** ${nextPlanningState.responses.duration}\n🎯 **Interests:** ${userResponse}\n\nLet me create a personalized itinerary with flights, hotels, activities, and more. This will just take a moment...`,
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
        name: `${responses.destination} Adventure - ${responses.duration}`
      }
      
      // Add trip and activities to mock data
      addNewTrip(personalizedTrip)
      addNewActivities(activities)
      
      // Final success message
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `🎉 **Trip Created Successfully!**\n\nI've created your "${personalizedTrip.name}" itinerary with ${activities.length} activities perfectly tailored to your interests. You'll be redirected to your trip timeline where you can:\n\n✈️ Review all planned activities\n📝 Customize any details\n💳 Book activities when you're ready\n\nMost activities are marked as "planned" so you have full control over your bookings!`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, successMessage])
      
      // Redirect to the new trip
      setTimeout(() => {
        router.push(`/trip/${personalizedTrip.id}/timeline`)
      }, 2000)
      
    } catch (error) {
      console.error('Error generating trip:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I encountered an issue creating your trip. Please refresh the page and try again.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Plan Your Perfect Trip
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Describe your dream vacation and I'll create a detailed itinerary for you
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-2 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  planningState.step === 'initial' 
                    ? "Where would you like to go? (e.g., Tokyo, Paris, New York...)"
                    : planningState.step === 'destination'
                    ? "How long would you like to stay? (e.g., 3 days, a week, 10 days...)"
                    : planningState.step === 'duration'
                    ? "What activities interest you? (e.g., food and culture, museums, nightlife...)"
                    : "Tell me about your travel preferences..."
                }
                className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

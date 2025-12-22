'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search, Plus, X, Check, Loader2, Info } from 'lucide-react'
import { generateMockTrip } from '@/lib/trip-generator'
import { tripService } from '@/lib/trip-service'
import { INTERESTS, PACING_OPTIONS } from '@/lib/interests-config'
import type { TripPacing, TripInterest } from '@/types/simple'

// Types
type WizardStep = 'destinations' | 'dates' | 'style' | 'pacing' | 'loading'

interface WizardData {
  destinations: string[]
  customDestination: string
  hasSpecificDates: boolean | null
  startDate: string
  endDate: string
  duration: string | null
  customDuration: string
  interests: TripInterest[]
  customInterest: string
  pacing: TripPacing | null
}

// Destination options with Unsplash images
const DESTINATIONS = [
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop' },
  { id: 'paris', name: 'Paris', country: 'France', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop' },
  { id: 'london', name: 'London', country: 'UK', flag: '🇬🇧', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop' },
  { id: 'nyc', name: 'New York', country: 'USA', flag: '🇺🇸', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop' },
  { id: 'rome', name: 'Rome', country: 'Italy', flag: '🇮🇹', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', flag: '🇪🇸', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=300&fit=crop' },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=400&h=300&fit=crop' },
]

const DURATIONS = [
  { id: 'weekend', name: 'Weekend', days: '2-3 days', icon: '⚡' },
  { id: 'week', name: '1 Week', days: '7 days', icon: '📅' },
  { id: '10days', name: '10 Days', days: '10 days', icon: '✈️' },
  { id: '2weeks', name: '2 Weeks', days: '14 days', icon: '🌍' },
  { id: '3weeks', name: '3+ Weeks', days: '21+ days', icon: '🗺️' },
]

// Loading messages that cycle during trip generation
const LOADING_MESSAGES = [
  'Analyzing your preferences...',
  'Selecting activities you\'ll love...',
  'Optimizing your itinerary...',
  'Adding local recommendations...',
  'Almost there...',
]

const STEPS: WizardStep[] = ['destinations', 'dates', 'style', 'pacing', 'loading']

const STEP_TITLES: Record<WizardStep, string> = {
  destinations: 'Where do you want to go?',
  dates: 'When are you traveling?',
  style: 'What are your interests?',
  pacing: 'How do you like to travel?',
  loading: 'Creating your trip...',
}

export function TripWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('destinations')
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  
  const [data, setData] = useState<WizardData>({
    destinations: [],
    customDestination: '',
    hasSpecificDates: null,
    startDate: '',
    endDate: '',
    duration: null,
    customDuration: '',
    interests: [],
    customInterest: '',
    pacing: null,
  })

  // Cycle through loading messages
  useEffect(() => {
    if (currentStep === 'loading') {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [currentStep])

  // Auto-trigger generation when entering loading step
  useEffect(() => {
    if (currentStep === 'loading' && !isGenerating) {
      handleGenerate()
    }
  }, [currentStep])

  const currentStepIndex = STEPS.indexOf(currentStep)
  // Don't count loading step in progress
  const displayStepCount = STEPS.length - 1
  const progress = currentStep === 'loading' ? 100 : ((currentStepIndex + 1) / displayStepCount) * 100

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'destinations':
        return data.destinations.length > 0 || data.customDestination.trim().length > 0
      case 'dates':
        if (data.hasSpecificDates === null) return false
        if (data.hasSpecificDates) {
          return Boolean(data.startDate && data.endDate)
        } else {
          return data.duration !== null || data.customDuration.trim().length > 0
        }
      case 'style':
        return data.interests.length > 0 || data.customInterest.trim().length > 0
      case 'pacing':
        return data.pacing !== null
      case 'loading':
        return false // Can't proceed from loading
      default:
        return false
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  const toggleDestination = (id: string) => {
    setData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(id)
        ? prev.destinations.filter(d => d !== id)
        : [...prev.destinations, id]
    }))
  }

  const toggleInterest = (id: TripInterest) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(s => s !== id)
        : [...prev.interests, id]
    }))
  }

  const addCustomDestination = () => {
    if (data.customDestination.trim()) {
      setData(prev => ({
        ...prev,
        destinations: [...prev.destinations, `custom:${prev.customDestination.trim()}`],
        customDestination: ''
      }))
    }
  }

  const handleGenerate = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    
    try {
      // Build destination string from wizard data
      const destinationNames = data.destinations
        .map(d => d.startsWith('custom:') ? d.replace('custom:', '') : DESTINATIONS.find(dest => dest.id === d)?.name || d)
      
      const destinationsStr = destinationNames.join(', ')
      
      // Calculate duration
      let durationDays: number
      if (data.hasSpecificDates && data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      } else if (data.duration) {
        // Map duration id to approximate days
        const durationMap: Record<string, number> = {
          'weekend': 3,
          'week': 7,
          '10days': 10,
          '2weeks': 14,
          '3weeks': 21
        }
        durationDays = durationMap[data.duration] || 7
      } else {
        durationDays = parseInt(data.customDuration) || 7
      }
      
      const duration = DURATIONS.find(d => d.id === data.duration)?.days || data.customDuration
      
      const interestNames = data.interests.map(id => {
        const interest = INTERESTS.find(i => i.id === id)
        return interest?.name || id
      })
      const allInterests = [...interestNames, data.customInterest].filter(Boolean).join(', ')

      const prompt = `Trip to ${destinationsStr} for ${duration}, interested in ${allInterests}`
      
      // Generate trip template (using mock for now)
      // TODO: Backend should use data.interests to determine what event suggestions 
      // will be made. For example, if user selected 'food', suggest restaurants and food tours.
      // If user selected 'culture', suggest museums and historical sites.
      const { trip: generatedTrip, activities: generatedActivities } = generateMockTrip(prompt)
      
      // Create trip via tripService with personalized data
      // TODO: Backend should use data.pacing to control suggestion density:
      // - 'relaxed': Max 4-hour gaps between activities are acceptable
      // - 'moderate': Max 2-hour gaps between activities
      // - 'packed': Minimal gaps, back-to-back activities suggested
      const newTrip = await tripService.createTrip({
        name: `${destinationNames[0]} Adventure`,
        dateMode: data.hasSpecificDates ? 'fixed' : 'flexible',
        ...(data.hasSpecificDates 
          ? { startDate: data.startDate, endDate: data.endDate }
          : { duration: durationDays }
        ),
        color: generatedTrip.color,
        interests: data.interests,
        pacing: data.pacing || 'moderate',
      })
      
      // Create activities via tripService
      for (const activity of generatedActivities) {
        await tripService.createActivity({
          ...activity,
          tripId: newTrip.id,
        })
      }
      
      // Navigate to the trip timeline
      router.push(`/trip/${newTrip.id}/timeline`)
      
    } catch (error) {
      console.error('Error generating trip:', error)
      setIsGenerating(false)
      // Go back to pacing step on error
      setCurrentStep('pacing')
    }
  }

  const filteredDestinations = DESTINATIONS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderStep = () => {
    switch (currentStep) {
      case 'destinations':
        return (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Destination Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredDestinations.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => toggleDestination(dest.id)}
                  className={`relative overflow-hidden rounded-xl aspect-[4/3] group transition-all ${
                    data.destinations.includes(dest.id)
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                      : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{dest.flag}</span>
                      <span className="text-white font-medium text-sm">{dest.name}</span>
                    </div>
                  </div>
                  {data.destinations.includes(dest.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom destination input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Add a different destination..."
                  value={data.customDestination}
                  onChange={(e) => setData(prev => ({ ...prev, customDestination: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomDestination()}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {data.customDestination && (
                <button
                  onClick={addCustomDestination}
                  className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              )}
            </div>

            {/* Selected destinations pills */}
            {data.destinations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.destinations.map(d => {
                  const name = d.startsWith('custom:') 
                    ? d.replace('custom:', '') 
                    : DESTINATIONS.find(dest => dest.id === d)?.name || d
                  return (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {name}
                      <button
                        onClick={() => toggleDestination(d)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'dates':
        return (
          <div className="space-y-6">
            {/* Specific dates toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setData(prev => ({ ...prev, hasSpecificDates: true }))}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  data.hasSpecificDates === true
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-gray-900 dark:text-white">Specific dates</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">I know when I&apos;m going</div>
              </button>
              <button
                onClick={() => setData(prev => ({ ...prev, hasSpecificDates: false }))}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  data.hasSpecificDates === false
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-2xl mb-2">🤔</div>
                <div className="font-medium text-gray-900 dark:text-white">Flexible</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">I&apos;m still deciding</div>
              </button>
            </div>

            {/* Date picker for specific dates */}
            {data.hasSpecificDates === true && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={(e) => setData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End date
                  </label>
                  <input
                    type="date"
                    value={data.endDate}
                    onChange={(e) => setData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={data.startDate}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Duration buttons for flexible dates */}
            {data.hasSpecificDates === false && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">How long is your trip?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {DURATIONS.map(dur => (
                    <button
                      key={dur.id}
                      onClick={() => setData(prev => ({ ...prev, duration: dur.id, customDuration: '' }))}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        data.duration === dur.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{dur.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{dur.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{dur.days}</div>
                    </button>
                  ))}
                </div>

                {/* Custom duration */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Or enter a custom duration (e.g., 12 days)"
                    value={data.customDuration}
                    onChange={(e) => setData(prev => ({ ...prev, customDuration: e.target.value, duration: null }))}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 'style':
        return (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">Select all that apply</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {INTERESTS.map(interest => {
                const Icon = interest.icon
                const isSelected = data.interests.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{interest.name}</div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Custom interest */}
            <div className="relative">
              <input
                type="text"
                placeholder="Anything else? (e.g., local markets, hiking)"
                value={data.customInterest}
                onChange={(e) => setData(prev => ({ ...prev, customInterest: e.target.value }))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'pacing':
        return (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">This helps us suggest the right number of activities</p>
            
            <div className="space-y-3">
              {PACING_OPTIONS.map(option => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setData(prev => ({ ...prev, pacing: option.id }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                      data.pacing === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{option.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                    {data.pacing === option.id && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg text-gray-600 dark:text-gray-400 text-center"
              >
                {LOADING_MESSAGES[loadingMessageIndex]}
              </motion.p>
            </AnimatePresence>
            
            <div className="mt-8 flex gap-1">
              {LOADING_MESSAGES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === loadingMessageIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress bar - hide on loading */}
        {currentStep !== 'loading' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStepIndex + 1} of {displayStepCount}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              {STEP_TITLES[currentStep]}
            </h1>
            
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* "You can change this later" note - show on all steps except loading */}
        {currentStep !== 'loading' && (
          <div className="mt-6 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>You can change all of this later in your trip settings.</p>
          </div>
        )}

        {/* Navigation - hide on loading */}
        {currentStep !== 'loading' && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 'pacing' ? 'Create Trip' : 'Continue'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

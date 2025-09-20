// Main JavaScript for Pytoberfest 2025

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu")
  if (mobileMenu) {
    mobileMenu.classList.toggle("hidden")
  }
}

// Smooth scrolling for anchor links
document.addEventListener("DOMContentLoaded", () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]')

  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
})

// Animated counter for statistics
function animateCounter(element, target, duration = 2000) {
  const start = 0
  const increment = target / (duration / 16)
  let current = start

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current).toLocaleString()
  }, 16)
}

// Initialize counters when they come into view
const observerOptions = {
  threshold: 0.5,
  rootMargin: "0px 0px -100px 0px",
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.classList.contains("animated")) {
      const target = Number.parseInt(entry.target.dataset.target)
      animateCounter(entry.target, target)
      entry.target.classList.add("animated")
    }
  })
}, observerOptions)

// Observe all counter elements
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter")
  counters.forEach((counter) => {
    counterObserver.observe(counter)
  })
})

// Challenge filtering functionality
class ChallengeFilter {
  constructor() {
    this.challenges = []
    this.filteredChallenges = []
    this.currentFilters = {
      difficulty: "all",
      tag: "all",
      search: "",
    }

    this.init()
  }

  init() {
    // Initialize filter event listeners
    const difficultySelect = document.querySelector('select[name="difficulty"]')
    const tagSelect = document.querySelector('select[name="tag"]')
    const searchInput = document.querySelector('input[type="search"]')

    if (difficultySelect) {
      difficultySelect.addEventListener("change", (e) => {
        this.currentFilters.difficulty = e.target.value
        this.applyFilters()
      })
    }

    if (tagSelect) {
      tagSelect.addEventListener("change", (e) => {
        this.currentFilters.tag = e.target.value
        this.applyFilters()
      })
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.currentFilters.search = e.target.value.toLowerCase()
        this.applyFilters()
      })
    }

    // Load initial challenges
    this.loadChallenges()
  }

  async loadChallenges() {
    try {
      const response = await fetch("/api/challenges/")
      this.challenges = await response.json()
      this.filteredChallenges = [...this.challenges]
      this.renderChallenges()
    } catch (error) {
      console.error("Error loading challenges:", error)
    }
  }

  applyFilters() {
    this.filteredChallenges = this.challenges.filter((challenge) => {
      // Difficulty filter
      if (this.currentFilters.difficulty !== "all" && challenge.difficulty !== this.currentFilters.difficulty) {
        return false
      }

      // Tag filter
      if (this.currentFilters.tag !== "all" && !challenge.tags.includes(this.currentFilters.tag)) {
        return false
      }

      // Search filter
      if (
        this.currentFilters.search &&
        !challenge.title.toLowerCase().includes(this.currentFilters.search) &&
        !challenge.description.toLowerCase().includes(this.currentFilters.search)
      ) {
        return false
      }

      return true
    })

    this.renderChallenges()
    this.updateResultsCount()
  }

  renderChallenges() {
    const container = document.querySelector(".challenges-grid")
    if (!container) return

    if (this.filteredChallenges.length === 0) {
      container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No challenges found</h3>
                    <p class="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
            `
      return
    }

    container.innerHTML = this.filteredChallenges.map((challenge) => this.renderChallengeCard(challenge)).join("")
  }

  renderChallengeCard(challenge) {
    const difficultyClass =
      {
        Beginner: "difficulty-beginner",
        Intermediate: "difficulty-intermediate",
        Advanced: "difficulty-advanced",
      }[challenge.difficulty] || "difficulty-beginner"

    return `
            <div class="challenge-card hover-lift">
                <div class="flex items-center justify-between mb-4">
                    <span class="badge ${difficultyClass}">${challenge.difficulty}</span>
                    <span class="text-python-blue font-semibold">${challenge.points} pts</span>
                </div>
                
                <h3 class="font-semibold text-xl mb-3 text-charcoal">${challenge.title}</h3>
                <p class="text-gray-600 mb-4">${challenge.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${challenge.tags
                      .map((tag) => `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">${tag}</span>`)
                      .join("")}
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <span class="text-sm text-gray-500">${challenge.repository}</span>
                    <div class="flex items-center text-sm text-gray-500">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                        </svg>
                        Est. 2-4 hours
                    </div>
                </div>
                
                <button class="w-full btn-python" onclick="startChallenge(${challenge.id})">
                    Start Challenge
                </button>
            </div>
        `
  }

  updateResultsCount() {
    const countElement = document.querySelector(".results-count")
    if (countElement) {
      countElement.textContent = `Showing ${this.filteredChallenges.length} challenges`
    }
  }
}

// Challenge interaction functions
function startChallenge(challengeId) {
  // In a real app, this would handle user authentication and challenge enrollment
  console.log(`Starting challenge ${challengeId}`)

  // For now, show a simple alert
  alert(`Challenge ${challengeId} started! Check your email for detailed instructions.`)
}

// Progress tracking
class ProgressTracker {
  constructor() {
    this.userProgress = {
      challengesCompleted: 0,
      totalPoints: 0,
      currentStreak: 0,
      rank: null,
    }
  }

  async loadUserProgress(userId) {
    try {
      const response = await fetch(`/api/users/${userId}/progress`)
      this.userProgress = await response.json()
      this.updateProgressDisplay()
    } catch (error) {
      console.error("Error loading user progress:", error)
    }
  }

  updateProgressDisplay() {
    // Update progress bars and statistics
    const progressElements = {
      challenges: document.querySelector(".challenges-completed"),
      points: document.querySelector(".total-points"),
      streak: document.querySelector(".current-streak"),
      rank: document.querySelector(".user-rank"),
    }

    Object.entries(progressElements).forEach(([key, element]) => {
      if (element && this.userProgress[key] !== undefined) {
        element.textContent = this.userProgress[key]
      }
    })
  }
}

// Notification system
class NotificationSystem {
  constructor() {
    this.container = this.createContainer()
  }

  createContainer() {
    const container = document.createElement("div")
    container.className = "fixed top-4 right-4 z-50 space-y-2"
    container.id = "notification-container"
    document.body.appendChild(container)
    return container
  }

  show(message, type = "info", duration = 5000) {
    const notification = document.createElement("div")
    notification.className = `
            px-4 py-3 rounded-lg shadow-lg max-w-sm transform transition-all duration-300
            ${this.getTypeClasses(type)}
        `

    notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg leading-none">&times;</button>
            </div>
        `

    this.container.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, duration)
  }

  getTypeClasses(type) {
    const classes = {
      success: "bg-green-100 text-green-800 border border-green-200",
      error: "bg-red-100 text-red-800 border border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      info: "bg-blue-100 text-blue-800 border border-blue-200",
    }
    return classes[type] || classes.info
  }
}

// Initialize components when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize challenge filter on challenges page
  if (document.querySelector(".challenges-grid")) {
    new ChallengeFilter()
  }

  // Initialize notification system
  window.notifications = new NotificationSystem()

  // Initialize progress tracker if user is logged in
  const userId = document.body.dataset.userId
  if (userId) {
    const progressTracker = new ProgressTracker()
    progressTracker.loadUserProgress(userId)
  }

  // Add loading states to buttons
  const buttons = document.querySelectorAll("button[data-loading]")
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.add("loading")
      this.disabled = true

      // Remove loading state after 2 seconds (adjust based on actual API response time)
      setTimeout(() => {
        this.classList.remove("loading")
        this.disabled = false
      }, 2000)
    })
  })
})

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatNumber(num) {
  return num.toLocaleString()
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Export for use in other scripts
window.PytoberfestApp = {
  ChallengeFilter,
  ProgressTracker,
  NotificationSystem,
  startChallenge,
  formatDate,
  formatNumber,
  debounce,
}

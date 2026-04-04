import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
}

const initialAnalyzeForm = {
  gender: 'female',
  style: 'minimal',
  occasion: 'city dinner',
}

const initialImageForm = {
  prompt: 'Editorial streetwear look with clean tailoring, warm neutrals, and premium sneakers.',
}

const heroStats = [
  { value: '1 click', label: 'From idea to styled outfit' },
  { value: 'Pro', label: 'Unlimited image generations' },
  { value: 'Shop-ready', label: 'Affiliate product links included' },
]

const featureCards = [
  {
    title: 'Style DNA',
    text: 'Generate a full outfit direction from gender, mood, and occasion in seconds.',
  },
  {
    title: 'AI Image Studio',
    text: 'Turn prompts into polished concept imagery and premium visual looks.',
  },
  {
    title: 'Monetize The Flow',
    text: 'Attach affiliate-ready product links and a Pro checkout path inside one funnel.',
  },
]

const uploadTips = [
  'Full-body photo with your face forward',
  'Natural light and clean background',
  'No mirror crop, bag, or heavy obstruction',
]

const starterBrands = ['Aritzia', 'Zara', 'Mango', 'H&M', 'COS', 'Massimo Dutti']

const starterLooks = [
  {
    id: 'city-minimal',
    label: 'City Minimal',
    brand: 'COS',
    style: 'minimal luxe',
    occasion: 'city dinner',
    prompt: 'Quiet luxury city look with a sculpted blazer, wide-leg trousers, leather shoulder bag, and tonal heels.',
  },
  {
    id: 'street-editorial',
    label: 'Street Editorial',
    brand: 'Zara',
    style: 'editorial streetwear',
    occasion: 'weekend coffee run',
    prompt: 'Editorial streetwear with cropped bomber, fluid trousers, premium sneakers, and sharp golden-hour lighting.',
  },
  {
    id: 'soft-feminine',
    label: 'Soft Feminine',
    brand: 'Aritzia',
    style: 'soft feminine',
    occasion: 'brunch date',
    prompt: 'Soft feminine brunch outfit with a fitted knit top, flowing midi skirt, delicate jewelry, and fresh daylight.',
  },
]

const socialProof = [
  {
    title: 'Looks like real shopping',
    text: 'Users stay longer when they can start from a photo, see style direction, and jump straight into product discovery.',
  },
  {
    title: 'Fast first win',
    text: 'The first screen should let them imagine themselves in the product before they think about signup friction.',
  },
  {
    title: 'Guided next step',
    text: 'When the page already knows the vibe, the brand, and the prompt, conversion friction drops immediately.',
  },
]

const lookbookStories = [
  {
    name: 'After-work reset',
    mood: 'Refined and sharp',
    highlight: 'Blazer + fluid trouser + soft gold accessories',
    note: 'Best for visitors who want a quick premium first impression.',
  },
  {
    name: 'Weekend editor',
    mood: 'Relaxed but expensive',
    highlight: 'Bomber + wide-leg denim + premium sneaker balance',
    note: 'Feels casual, but still product-worthy enough to share.',
  },
  {
    name: 'Date-night polish',
    mood: 'Soft and elevated',
    highlight: 'Clean knit + sculpted skirt + tonal heel direction',
    note: 'Useful when the page needs emotional pull, not just utility.',
  },
]

const testimonials = [
  {
    quote: 'This feels like shopping with a stylist instead of filling out a form.',
    author: 'Laylo, early beta user',
  },
  {
    quote: 'The prepared looks made me stay. I knew what to click immediately.',
    author: 'Madina, fashion creator',
  },
  {
    quote: 'Brand-first browsing made the product feel real, not experimental.',
    author: 'Aziza, ecommerce operator',
  },
]

const faqItems = [
  {
    question: 'What keeps visitors from bouncing immediately?',
    answer: 'A strong first screen, a photo-first action, and a prefilled next step. If the user sees what to do in under 10 seconds, retention improves fast.',
  },
  {
    question: 'Why show brands before login?',
    answer: 'Because shoppers trust stores and aesthetics first. Brand recognition makes the experience feel familiar before any account friction appears.',
  },
  {
    question: 'How does this connect to the existing backend?',
    answer: 'The new landing experience still uses the same backend config, auth, analysis, image generation, billing, and shop endpoints already wired in this app.',
  },
]

const conversionSignals = [
  'Photo-first onboarding',
  'Starter looks prefilled',
  'Brand-aware product picks',
]

const studioSteps = [
  { id: 'account', label: 'Create account', hint: 'Unlock your saved flow' },
  { id: 'analyze', label: 'Confirm style plan', hint: 'Adjust vibe and occasion' },
  { id: 'render', label: 'Generate the look', hint: 'See the styled output' },
]

const authBenefits = [
  'Free first render for new users',
  'Starter look already loaded below',
  'Upgrade path only appears when useful',
]

const initialAdminShopForm = {
  name: '',
  brand: '',
  store: '',
  category: 'Tops',
  description: '',
  image: '',
  link: '',
  sortOrder: '0',
}

const fallbackProductCategories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories']

function inferCategoryFromName(name = '') {
  const normalized = name.toLowerCase()

  if (/(jacket|coat|blazer|bomber|outerwear)/.test(normalized)) {
    return 'Outerwear'
  }

  if (/(jeans|trouser|pants|skirt|shorts)/.test(normalized)) {
    return 'Bottoms'
  }

  if (/(shoe|heel|loafer|boot|sneaker|sandal)/.test(normalized)) {
    return 'Footwear'
  }

  if (/(bag|belt|earring|necklace|scarf|jewelry)/.test(normalized)) {
    return 'Accessories'
  }

  return 'Tops'
}

function inferBrandFromProduct(item, fallbackBrand) {
  return item.brand || item.store || fallbackBrand
}

function getImageSource(image) {
  if (!image) {
    return ''
  }

  if (image.url) {
    return image.url
  }

  if (image.b64_json) {
    return `data:image/png;base64,${image.b64_json}`
  }

  return ''
}

function isLikelyHttpUrl(value) {
  if (!value) {
    return false
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function App() {
  const [authMode, setAuthMode] = useState('register')
  const [authForm, setAuthForm] = useState(initialAuthForm)
  const [analyzeForm, setAnalyzeForm] = useState(initialAnalyzeForm)
  const [imageForm, setImageForm] = useState(initialImageForm)
  const [token, setToken] = useState(() => localStorage.getItem('dressai-token') || '')
  const [user, setUser] = useState(null)
  const [config, setConfig] = useState({ authEnabled: true, paymentEnabled: false })
  const [authStatus, setAuthStatus] = useState('')
  const [studioStatus, setStudioStatus] = useState('')
  const [shopStatus, setShopStatus] = useState('')
  const [adminStatus, setAdminStatus] = useState('')
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [imageResult, setImageResult] = useState(null)
  const [shopItems, setShopItems] = useState([])
  const [adminStats, setAdminStats] = useState(null)
  const [adminUsers, setAdminUsers] = useState([])
  const [adminShopProducts, setAdminShopProducts] = useState([])
  const [adminShopStatus, setAdminShopStatus] = useState('')
  const [adminShopForm, setAdminShopForm] = useState(initialAdminShopForm)
  const [adminShopEditorId, setAdminShopEditorId] = useState(null)
  const [busy, setBusy] = useState({ auth: false, analyze: false, image: false, billing: false, adminCatalog: false })
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(starterBrands[0])
  const [selectedStarterId, setSelectedStarterId] = useState(starterLooks[0].id)
  const [activeView, setActiveView] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'home'))
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [shopSearch, setShopSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const selectedStarter = useMemo(
    () => starterLooks.find((item) => item.id === selectedStarterId) || starterLooks[0],
    [selectedStarterId],
  )

  const featuredBrands = useMemo(() => {
    const brandsFromShop = shopItems
      .map((item) => item.brand || item.store || item.name)
      .filter(Boolean)
      .map((value) => String(value).split(' ')[0])

    return Array.from(new Set([...starterBrands, ...brandsFromShop])).slice(0, 10)
  }, [shopItems])

  const curatedShopItems = useMemo(() => {
    const normalizedBrand = selectedBrand.trim().toLowerCase()
    const filtered = shopItems.filter((item) => {
      const candidate = `${item.brand || ''} ${item.store || ''} ${item.name || ''}`.toLowerCase()
      return candidate.includes(normalizedBrand)
    })

    return (filtered.length ? filtered : shopItems).slice(0, 6)
  }, [selectedBrand, shopItems])

  const generatedImageUrl = useMemo(() => getImageSource(imageResult), [imageResult])

  const enrichedShopItems = useMemo(
    () => curatedShopItems.map((item) => ({
      ...item,
      brandLabel: inferBrandFromProduct(item, selectedBrand),
      category: item.category || inferCategoryFromName(item.name),
      descriptor: item.description || `${selectedStarter.style} pick for ${selectedStarter.occasion}`,
    })),
    [curatedShopItems, selectedBrand, selectedStarter.occasion, selectedStarter.style],
  )

  const visibleCategories = useMemo(() => {
    const categorySet = new Set(enrichedShopItems.map((item) => item.category))
    return ['All', ...fallbackProductCategories.filter((item) => categorySet.has(item)).filter((item) => item !== 'All')]
  }, [enrichedShopItems])

  const filteredShopItems = useMemo(() => {
    const query = shopSearch.trim().toLowerCase()

    return enrichedShopItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      const haystack = `${item.name} ${item.brandLabel} ${item.descriptor}`.toLowerCase()
      const matchesSearch = !query || haystack.includes(query)
      return matchesCategory && matchesSearch
    })
  }, [enrichedShopItems, selectedCategory, shopSearch])

  const recommendedProducts = useMemo(() => {
    const signals = [
      selectedStarter.style,
      selectedStarter.occasion,
      analyzeResult?.outfit?.top,
      analyzeResult?.outfit?.bottom,
      analyzeResult?.outfit?.outerwear,
      analyzeResult?.outfit?.footwear,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return [...enrichedShopItems]
      .map((item) => {
        const haystack = `${item.name} ${item.category} ${item.brandLabel} ${item.descriptor}`.toLowerCase()
        const score = signals.split(' ').reduce((total, token) => {
          if (token.length < 4) {
            return total
          }
          return total + (haystack.includes(token) ? 1 : 0)
        }, item.brandLabel === selectedBrand ? 2 : 0)

        return {
          ...item,
          score,
        }
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 3)
  }, [analyzeResult, enrichedShopItems, selectedBrand, selectedStarter.occasion, selectedStarter.style])

  const adminShopValidation = useMemo(() => {
    const missingFields = [
      ['name', 'Product name'],
      ['brand', 'Brand'],
      ['store', 'Store'],
      ['category', 'Category'],
      ['image', 'Image URL'],
      ['link', 'Product URL'],
    ].filter(([key]) => !String(adminShopForm[key] || '').trim())

    const errors = []

    if (missingFields.length > 0) {
      errors.push(`Required: ${missingFields.map(([, label]) => label).join(', ')}`)
    }

    if (adminShopForm.image && !isLikelyHttpUrl(adminShopForm.image)) {
      errors.push('Image URL must start with http:// or https://')
    }

    if (adminShopForm.link && !isLikelyHttpUrl(adminShopForm.link)) {
      errors.push('Product URL must start with http:// or https://')
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(' • '),
      hasImagePreview: isLikelyHttpUrl(adminShopForm.image),
    }
  }, [adminShopForm])

  const shopCatalogDiagnostics = config.shopCatalog || null

  const dashboardTitle = useMemo(() => {
    if (!user) {
      return 'Launch your DressAI web studio'
    }

    return user.plan === 'pro'
      ? 'Pro studio unlocked'
      : 'Free studio active, upgrade for unlimited generations'
  }, [user])

  useEffect(() => {
    let ignore = false

    async function bootstrap() {
      try {
        const [configResponse, shopResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/config`),
          fetch(`${API_BASE_URL}/shop`),
        ])

        const [configData, shopData] = await Promise.all([
          configResponse.json(),
          shopResponse.json(),
        ])

        if (!ignore) {
          setConfig(configData)
          setShopItems(Array.isArray(shopData) ? shopData : [])
        }
      } catch (error) {
        if (!ignore) {
          setShopStatus(error.message || 'Backend connection failed.')
        }
      }
    }

    bootstrap()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => () => {
    if (uploadedPhotoUrl) {
      URL.revokeObjectURL(uploadedPhotoUrl)
    }
  }, [uploadedPhotoUrl])

  useEffect(() => {
    if (!token) {
      setUser(null)
      localStorage.removeItem('dressai-token')
      return
    }

    localStorage.setItem('dressai-token', token)
    refreshUser(token)
  }, [token])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')

    if (sessionId && token) {
      confirmPayment(sessionId, token)
    }
  }, [token])

  useEffect(() => {
    if (!token || !user?.isAdmin) {
      setAdminStats(null)
      setAdminUsers([])
      setAdminShopProducts([])
      return
    }

    loadAdminPanel(token)
  }, [token, user?.isAdmin])

  useEffect(() => {
    function syncViewFromHash() {
      setActiveView(window.location.hash === '#admin' ? 'admin' : 'home')
    }

    window.addEventListener('hashchange', syncViewFromHash)

    return () => {
      window.removeEventListener('hashchange', syncViewFromHash)
    }
  }, [])

  useEffect(() => {
    if (!isAuthModalOpen) {
      return undefined
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsAuthModalOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isAuthModalOpen])

  async function apiRequest(path, options = {}, authToken = token) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Request failed.')
    }

    return data
  }

  async function refreshUser(authToken = token) {
    try {
      const data = await apiRequest('/auth/me', {}, authToken)
      setUser(data.user)
      return data.user
    } catch (error) {
      setUser(null)
      setToken('')
      setAuthStatus(error.message)
      return null
    }
  }

  async function loadAdminPanel(authToken = token) {
    setAdminStatus('')
    setAdminShopStatus('')

    try {
      const [statsData, usersData, shopData] = await Promise.all([
        apiRequest('/admin/stats', {}, authToken),
        apiRequest('/admin/users', {}, authToken),
        apiRequest('/admin/shop-products', {}, authToken),
      ])

      setAdminStats(statsData.stats || null)
      setAdminUsers(Array.isArray(usersData.users) ? usersData.users : [])
      setAdminShopProducts(Array.isArray(shopData.products) ? shopData.products : [])
      if (shopData.diagnostics) {
        setConfig((current) => ({ ...current, shopCatalog: shopData.diagnostics }))
      }
    } catch (error) {
      setAdminStatus(error.message)
    }
  }

  async function confirmPayment(sessionId, authToken) {
    setBusy((current) => ({ ...current, billing: true }))

    try {
      const data = await apiRequest(`/billing/confirm?session_id=${encodeURIComponent(sessionId)}`, {}, authToken)
      setUser(data.user)
      setStudioStatus('Payment confirmed. Pro plan is now active.')
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.delete('session_id')
      window.history.replaceState({}, '', nextUrl)
    } catch (error) {
      setStudioStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, billing: false }))
    }
  }

  function handleAuthFieldChange(event) {
    const { name, value } = event.target
    setAuthForm((current) => ({ ...current, [name]: value }))
  }

  function handleAnalyzeFieldChange(event) {
    const { name, value } = event.target
    setAnalyzeForm((current) => ({ ...current, [name]: value }))
  }

  function handleImageFieldChange(event) {
    const { name, value } = event.target
    setImageForm((current) => ({ ...current, [name]: value }))
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (uploadedPhotoUrl) {
      URL.revokeObjectURL(uploadedPhotoUrl)
    }

    setUploadedPhotoUrl(URL.createObjectURL(file))
    setStudioStatus('Photo added. Now choose a starter look and open the studio.')
  }

  function applyStarterLook(starter) {
    setSelectedStarterId(starter.id)
    setSelectedBrand(starter.brand)
    setAnalyzeForm((current) => ({
      ...current,
      style: starter.style,
      occasion: starter.occasion,
    }))
    setImageForm({ prompt: starter.prompt })
    setStudioStatus(`Starter look loaded: ${starter.label}. Continue in the studio below.`)
  }

  function openAdminView() {
    window.location.hash = 'admin'
    setActiveView('admin')
  }

  function openAuthModal(mode = 'register') {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false)
  }

  function openHomeView() {
    if (window.location.hash) {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
    }
    setActiveView('home')
  }

  function handleAdminShopFieldChange(event) {
    const { name, value } = event.target
    setAdminShopForm((current) => ({ ...current, [name]: value }))
  }

  function resetAdminShopForm() {
    setAdminShopForm(initialAdminShopForm)
    setAdminShopEditorId(null)
  }

  function startAdminShopEdit(product) {
    setAdminShopEditorId(product.id)
    setAdminShopForm({
      name: product.name || '',
      brand: product.brand || '',
      store: product.store || '',
      category: product.category || 'Tops',
      description: product.description || '',
      image: product.image || '',
      link: product.link || '',
      sortOrder: String(product.sortOrder ?? 0),
    })
    setAdminShopStatus(`Editing product #${product.id}`)
  }

  async function handleAdminShopSubmit(event) {
    event.preventDefault()

    if (!adminShopValidation.isValid) {
      setAdminShopStatus(adminShopValidation.message)
      return
    }

    setBusy((current) => ({ ...current, adminCatalog: true }))
    setAdminShopStatus('')

    const payload = {
      ...adminShopForm,
      sortOrder: Number(adminShopForm.sortOrder) || 0,
    }

    try {
      const response = adminShopEditorId
        ? await apiRequest(`/admin/shop-products/${adminShopEditorId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        : await apiRequest('/admin/shop-products', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

      const savedProduct = response.product

      setAdminShopProducts((current) => {
        if (adminShopEditorId) {
          return current
            .map((entry) => (entry.id === adminShopEditorId ? savedProduct : entry))
            .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name))
        }

        return [...current, savedProduct]
          .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name))
      })

      setAdminShopStatus(adminShopEditorId ? 'Catalog product updated.' : 'Catalog product created.')
      resetAdminShopForm()
    } catch (error) {
      setAdminShopStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, adminCatalog: false }))
    }
  }

  async function handleAdminShopDelete(productId) {
    setBusy((current) => ({ ...current, adminCatalog: true }))
    setAdminShopStatus('')

    try {
      await apiRequest(`/admin/shop-products/${productId}`, {
        method: 'DELETE',
      })

      setAdminShopProducts((current) => current.filter((entry) => entry.id !== productId))

      if (adminShopEditorId === productId) {
        resetAdminShopForm()
      }

      setAdminShopStatus('Catalog product deleted.')
    } catch (error) {
      setAdminShopStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, adminCatalog: false }))
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setBusy((current) => ({ ...current, auth: true }))
    setAuthStatus('')

    const path = authMode === 'register' ? '/auth/register' : '/auth/login'
    const payload = authMode === 'register'
      ? authForm
      : { email: authForm.email, password: authForm.password }

    try {
      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      }, '')

      setToken(data.token)
      setUser(data.user)
      setAuthStatus(authMode === 'register' ? 'Account created.' : 'Logged in.')
      setIsAuthModalOpen(false)
    } catch (error) {
      setAuthStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, auth: false }))
    }
  }

  async function handleAnalyzeSubmit(event) {
    event.preventDefault()
    setBusy((current) => ({ ...current, analyze: true }))
    setStudioStatus('')

    try {
      const data = await apiRequest('/analyze', {
        method: 'POST',
        body: JSON.stringify(analyzeForm),
      })

      setAnalyzeResult(data.recommendations)
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      setStudioStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, analyze: false }))
    }
  }

  async function handleImageSubmit(event) {
    event.preventDefault()
    setBusy((current) => ({ ...current, image: true }))
    setStudioStatus('')

    try {
      const data = await apiRequest('/image', {
        method: 'POST',
        body: JSON.stringify(imageForm),
      })

      setImageResult(data.image)
      if (data.user) {
        setUser(data.user)
      }
      if (typeof data.remainingGenerations === 'number') {
        setStudioStatus(`Remaining free generations: ${data.remainingGenerations}`)
      }
    } catch (error) {
      setStudioStatus(error.message)
    } finally {
      setBusy((current) => ({ ...current, image: false }))
    }
  }

  async function handleUpgrade() {
    setBusy((current) => ({ ...current, billing: true }))
    setStudioStatus('')

    try {
      const origin = window.location.origin
      const data = await apiRequest('/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          successUrl: `${origin}?upgrade=success`,
          cancelUrl: `${origin}?upgrade=cancelled`,
        }),
      })

      window.location.href = data.checkoutUrl
    } catch (error) {
      setStudioStatus(error.message)
      setBusy((current) => ({ ...current, billing: false }))
    }
  }

  function handleLogout() {
    setToken('')
    setUser(null)
    setAnalyzeResult(null)
    setImageResult(null)
    setAdminStats(null)
    setAdminUsers([])
    setStudioStatus('Signed out.')
  }

  if (activeView === 'admin') {
    return (
      <div className="page-shell admin-page-shell">
        <section className="section-block admin-entry-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Private workspace</p>
              <h3>DressAI admin overview and operator controls.</h3>
            </div>
            <div className="topbar-actions">
              <button type="button" className="ghost-button small" onClick={openHomeView}>
                Back to homepage
              </button>
              {user ? (
                <button type="button" className="ghost-button small" onClick={handleLogout}>
                  Log out
                </button>
              ) : null}
            </div>
          </div>

          {!user?.isAdmin ? (
            <div className="admin-gate-card">
              <p className="eyebrow">Restricted</p>
              <h4>Admin access required</h4>
              <p>Sign in with an admin account to view user, plan, and generation activity.</p>
              <div className="hero-actions compact">
                <button type="button" className="solid-button" onClick={openHomeView}>
                  Go to sign in
                </button>
                <button type="button" className="ghost-button" onClick={openHomeView}>
                  Return home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="admin-stats-grid">
                {[
                  { label: 'Users', value: adminStats?.totalUsers ?? '—' },
                  { label: 'Pro users', value: adminStats?.proUsers ?? '—' },
                  { label: 'Free users', value: adminStats?.freeUsers ?? '—' },
                  { label: 'Weekly signups', value: adminStats?.recentUsers ?? '—' },
                  { label: 'Image generations', value: adminStats?.totalImageGenerations ?? '—' },
                  { label: 'Admins', value: adminStats?.adminUsers ?? '—' },
                ].map((item) => (
                  <article key={item.label} className="stat-card admin-stat-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>

              <div className="admin-table-card">
                <div className="admin-table-head">
                  <span>User</span>
                  <span>Email</span>
                  <span>Plan</span>
                  <span>Generations</span>
                </div>
                <div className="admin-table-body">
                  {adminUsers.map((entry) => (
                    <article key={entry.id} className="admin-table-row">
                      <div>
                        <strong>{entry.name}</strong>
                        <span>{entry.isAdmin ? 'Admin' : 'Member'}</span>
                      </div>
                      <span>{entry.email}</span>
                      <span>{entry.plan}</span>
                      <span>{entry.imageGenerationCount}</span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="admin-toolbar">
                <p className="status-line">{adminStatus || 'Admin email access is controlled by ADMIN_EMAIL or ADMIN_EMAILS in the backend env.'}</p>
                <button type="button" className="solid-button small" onClick={() => loadAdminPanel()}>
                  Refresh admin data
                </button>
              </div>

              <section className="admin-catalog-shell">
                <div className="section-heading split-heading compact-heading">
                  <div>
                    <p className="eyebrow">Catalog manager</p>
                    <h3>Control the products shown in the shop experience.</h3>
                  </div>
                  {adminShopEditorId ? (
                    <button type="button" className="ghost-button small" onClick={resetAdminShopForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>

                <div className="admin-catalog-meta">
                  <div className="recommendation-tags compact-tags">
                    <span className="signal-pill">Configured {shopCatalogDiagnostics?.configuredMode || 'unknown'}</span>
                    <span className="signal-pill">Active {shopCatalogDiagnostics?.activeSource || 'unknown'}</span>
                    <span className="signal-pill">Table {shopCatalogDiagnostics?.tableName || 'fallback only'}</span>
                    <span className="signal-pill">Fallback {shopCatalogDiagnostics?.fallbackCount ?? 0}</span>
                  </div>
                  <p className="status-line">
                    {shopCatalogDiagnostics?.activeSource === 'supabase'
                      ? 'Catalog is currently serving from Supabase.'
                      : 'Catalog is currently serving from fallback data.'}
                  </p>
                </div>

                <div className="admin-catalog-grid">
                  <form className="admin-product-form" onSubmit={handleAdminShopSubmit}>
                    <label>
                      <span>Product name</span>
                      <input name="name" value={adminShopForm.name} onChange={handleAdminShopFieldChange} placeholder="Tailored Wool Blazer" />
                    </label>
                    <label>
                      <span>Brand</span>
                      <input name="brand" value={adminShopForm.brand} onChange={handleAdminShopFieldChange} placeholder="COS" />
                    </label>
                    <label>
                      <span>Store</span>
                      <input name="store" value={adminShopForm.store} onChange={handleAdminShopFieldChange} placeholder="COS" />
                    </label>
                    <label>
                      <span>Category</span>
                      <select name="category" value={adminShopForm.category} onChange={handleAdminShopFieldChange}>
                        {fallbackProductCategories.filter((item) => item !== 'All').map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea name="description" value={adminShopForm.description} onChange={handleAdminShopFieldChange} rows="4" placeholder="Explain why this item fits the current style direction" />
                    </label>
                    <label>
                      <span>Image URL</span>
                      <input name="image" value={adminShopForm.image} onChange={handleAdminShopFieldChange} placeholder="https://..." />
                    </label>
                    {adminShopValidation.hasImagePreview ? (
                      <div className="admin-image-preview">
                        <img src={adminShopForm.image} alt={adminShopForm.name || 'Catalog preview'} />
                      </div>
                    ) : null}
                    <label>
                      <span>Product URL</span>
                      <input name="link" value={adminShopForm.link} onChange={handleAdminShopFieldChange} placeholder="https://..." />
                    </label>
                    <label>
                      <span>Sort order</span>
                      <input name="sortOrder" type="number" value={adminShopForm.sortOrder} onChange={handleAdminShopFieldChange} placeholder="0" />
                    </label>
                    <button type="submit" className="solid-button wide" disabled={busy.adminCatalog || !adminShopValidation.isValid}>
                      {busy.adminCatalog ? 'Saving...' : adminShopEditorId ? 'Update product' : 'Create product'}
                    </button>
                    <p className={`status-line ${adminShopStatus ? 'status-line-error' : adminShopValidation.message ? 'status-line-warning' : ''}`}>
                      {adminShopStatus || adminShopValidation.message || 'Use this panel to manage the public shop catalog.'}
                    </p>
                  </form>

                  <div className="admin-product-list">
                    {adminShopProducts.map((product) => (
                      <article key={product.id} className="admin-product-card">
                        <img src={product.image} alt={product.name} />
                        <div>
                          <span className="shop-meta">{product.brand || product.store}</span>
                          <h4>{product.name}</h4>
                          <p>{product.description}</p>
                          <div className="recommendation-tags compact-tags">
                            <span className="signal-pill">{product.category}</span>
                            <span className="signal-pill">Sort {product.sortOrder ?? 0}</span>
                          </div>
                          <div className="admin-product-actions">
                            <button type="button" className="ghost-button small" onClick={() => startAdminShopEdit(product)} disabled={busy.adminCatalog}>
                              Edit
                            </button>
                            <button type="button" className="ghost-button small danger-button" onClick={() => handleAdminShopDelete(product.id)} disabled={busy.adminCatalog}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <header className="hero-section">
        <nav className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark">D</span>
            <div>
              <p className="eyebrow">DressAI Web</p>
              <h1>Landing page and studio in one flow.</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <a href="#studio" className="ghost-button">Open Studio</a>
            {user?.isAdmin ? (
              <button type="button" className="ghost-button" onClick={openAdminView}>
                Admin
              </button>
            ) : null}
            <a href="#shop" className="solid-button">Shop Picks</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="hero-kicker">AI try-on onboarding, fashion discovery, premium studio</p>
            <h2>Upload once. Discover outfits people actually want to try on.</h2>
            <p className="hero-text">
              Keep the backend power, but lead with a product experience: photo-first onboarding, brand-led browsing, and one-click starter looks that push users into the studio.
            </p>

            <div className="hero-actions">
              <button type="button" className="solid-button" onClick={() => openAuthModal('register')}>Start Free</button>
              <a href="#features" className="ghost-button">See Features</a>
            </div>

            <div className="stats-row">
              {heroStats.map((item) => (
                <article key={item.label} className="stat-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </section>

          <aside className="hero-panel">
            <div className="panel-badge">Instant try-on onboarding</div>
            <label className="upload-dropzone">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              {uploadedPhotoUrl ? (
                <img src={uploadedPhotoUrl} alt="Uploaded preview" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  <strong>Drop a full-body photo</strong>
                  <span>JPG or PNG. Good lighting works best.</span>
                </div>
              )}
            </label>
            <div className="tips-list">
              {uploadTips.map((tip) => (
                <div key={tip} className="tip-pill">{tip}</div>
              ))}
            </div>
            <div className="panel-preview">
              <p>Prepared studio prompt</p>
              <code>{selectedStarter.prompt}</code>
            </div>
          </aside>
        </div>
      </header>

      <main>
        <section className="brand-strip section-block">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Brand-first discovery</p>
              <h3>Make the page feel like fashion, not just a tool.</h3>
            </div>
          </div>

          <div className="brand-rail">
            {featuredBrands.map((brand) => (
              <button
                key={brand}
                type="button"
                className={selectedBrand === brand ? 'brand-pill active' : 'brand-pill'}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </section>

        <section className="section-block onboarding-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Guided try-on start</p>
              <h3>Give visitors a reason to keep clicking in the first 15 seconds.</h3>
            </div>
            <a href="#studio" className="solid-button small">Jump into studio</a>
          </div>

          <div className="onboarding-grid">
            <section className="journey-card">
              <div className="journey-step">1</div>
              <h4>Upload your photo</h4>
              <p>Even before signup, let the user imagine their own result with a preview-ready entry point.</p>
            </section>
            <section className="journey-card">
              <div className="journey-step">2</div>
              <h4>Pick a brand and vibe</h4>
              <p>Fashion shoppers think in stores and moods, not backend features. The page should speak that language.</p>
            </section>
            <section className="journey-card">
              <div className="journey-step">3</div>
              <h4>Open a prefilled try-on</h4>
              <p>Use prepared prompts and styles so the first generated result feels instant, not like work.</p>
            </section>
          </div>

          <div className="starter-shell">
            <div className="starter-list">
              {starterLooks.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  className={selectedStarter.id === starter.id ? 'starter-card active' : 'starter-card'}
                  onClick={() => applyStarterLook(starter)}
                >
                  <span>{starter.label}</span>
                  <strong>{starter.brand}</strong>
                  <small>{starter.occasion}</small>
                </button>
              ))}
            </div>

            <div className="starter-preview">
              <p className="eyebrow">Selected flow</p>
              <h4>{selectedStarter.label}</h4>
              <div className="preview-facts">
                <span>Brand: {selectedBrand}</span>
                <span>Style: {selectedStarter.style}</span>
                <span>Occasion: {selectedStarter.occasion}</span>
              </div>
              <p>{selectedStarter.prompt}</p>
              <div className="hero-actions compact">
                <button type="button" className="solid-button" onClick={() => applyStarterLook(selectedStarter)}>
                  Load into studio
                </button>
                <a href="#shop" className="ghost-button">See shop picks</a>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Why this site works</p>
            <h3>Not just a landing page. A conversion surface.</h3>
          </div>
          <div className="feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="feature-card">
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
          <div className="proof-grid">
            {socialProof.map((card) => (
              <article key={card.title} className="proof-card">
                <h4>{card.title}</h4>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block lookbook-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Result imagination</p>
              <h3>Show the feeling of the outcome before asking for work.</h3>
            </div>
            <button type="button" className="ghost-button small" onClick={() => openAuthModal('register')}>Start free flow</button>
          </div>

          <div className="lookbook-grid">
            <article className="lookbook-hero-card">
              <div className="lookbook-media">
                {uploadedPhotoUrl ? (
                  <img src={uploadedPhotoUrl} alt="Customer preview" className="lookbook-user-photo" />
                ) : (
                  <div className="lookbook-placeholder">
                    <strong>Your uploaded photo will appear here</strong>
                    <span>Once added, the rest of the page feels personal.</span>
                  </div>
                )}
                <div className="lookbook-overlay">
                  <span>Selected brand: {selectedBrand}</span>
                  <span>Chosen vibe: {selectedStarter.label}</span>
                </div>
              </div>
              <div className="lookbook-copy">
                <p className="eyebrow">What the visitor feels</p>
                <h4>“This already looks like my style. I want to see the result.”</h4>
                <p>
                  That reaction is the goal. The page should create curiosity first, then move the user into auth, analysis, and image generation with less resistance.
                </p>
              </div>
            </article>

            <div className="lookbook-story-grid">
              {lookbookStories.map((story) => (
                <article key={story.name} className="lookbook-story-card">
                  <span>{story.name}</span>
                  <h4>{story.mood}</h4>
                  <p>{story.highlight}</p>
                  <small>{story.note}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block transformation-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Transformation moment</p>
              <h3>Put the before and after feeling side by side.</h3>
            </div>
            <a href="#studio" className="ghost-button small">Generate your look</a>
          </div>

          <div className="transformation-grid">
            <article className="comparison-card before-card">
              <span className="comparison-label">Before</span>
              <div className="comparison-media">
                {uploadedPhotoUrl ? (
                  <img src={uploadedPhotoUrl} alt="Before styling" />
                ) : (
                  <div className="comparison-placeholder">
                    <strong>Upload a photo</strong>
                    <span>The original image preview appears here.</span>
                  </div>
                )}
              </div>
            </article>

            <article className="comparison-card after-card">
              <span className="comparison-label">After</span>
              <div className="comparison-media">
                {generatedImageUrl ? (
                  <img src={generatedImageUrl} alt="After styling" />
                ) : (
                  <div className="comparison-placeholder warm">
                    <strong>Generate the styled result</strong>
                    <span>The AI look will appear here after the first render.</span>
                  </div>
                )}
              </div>
            </article>

            <article className="transformation-copy-card">
              <p className="eyebrow">Why this works</p>
              <h4>The page now sells the outcome, not just the controls.</h4>
              <p>
                When users see a clear original state and a styled destination, they understand the product instantly. That makes them far more likely to upload, explore, and buy.
              </p>
              <div className="signal-list">
                {conversionSignals.map((item) => (
                  <span key={item} className="signal-pill">{item}</span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section id="studio" className="section-block studio-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Customer studio</p>
              <h3>{dashboardTitle}</h3>
            </div>
            {user ? (
              <button type="button" className="ghost-button small" onClick={handleLogout}>
                Log out
              </button>
            ) : null}
          </div>

          <div className="studio-progress-rail">
            {studioSteps.map((step, index) => (
              <article key={step.id} className="studio-step-card">
                <div className="studio-step-index">0{index + 1}</div>
                <div>
                  <strong>{step.label}</strong>
                  <span>{step.hint}</span>
                </div>
              </article>
            ))}
          </div>

          <section className="studio-setup-card">
            <div>
              <p className="eyebrow">Current starter flow</p>
              <h4>{selectedStarter.label} for {selectedBrand}</h4>
              <p>
                Your visitor is not starting from zero. The brand, occasion, and prompt are already prepared so the first interaction feels fast and intentional.
              </p>
            </div>
            <div className="setup-meta-list">
              <span>Brand: {selectedBrand}</span>
              <span>Style: {selectedStarter.style}</span>
              <span>Occasion: {selectedStarter.occasion}</span>
            </div>
            <div className="hero-actions compact">
              <button type="button" className="solid-button small" onClick={() => applyStarterLook(selectedStarter)}>
                Re-load starter look
              </button>
              <a href="#shop" className="ghost-button small">See matching products</a>
            </div>
          </section>

          <div className="studio-grid">
            <section id="auth" className="dashboard-card auth-entry-card">
              {user ? (
                <>
                  <div className="card-topline">
                    <span>Account ready</span>
                  </div>
                  <p className="status-line">Your session is active. Continue with analysis and render below.</p>
                  <div className="user-summary auth-ready-summary">
                    <strong>{user.name}</strong>
                    <span>Plan: {user.plan}</span>
                    <span>Remaining generations: {user.remainingGenerations === null ? 'Unlimited' : user.remainingGenerations}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="card-topline">
                    <span>Unlock your try-on flow</span>
                  </div>
                  <div className="auth-benefit-strip">
                    {authBenefits.map((item) => (
                      <span key={item} className="auth-benefit-pill">{item}</span>
                    ))}
                  </div>
                  <div className="auth-teaser-copy">
                    <h4>Open a fast signup modal when the visitor is ready.</h4>
                    <p>
                      Keep the landing page light. Let curiosity build first, then open a focused auth overlay without dropping the user into a heavy form block.
                    </p>
                  </div>
                  <div className="hero-actions compact auth-entry-actions">
                    <button type="button" className="solid-button wide" onClick={() => openAuthModal('register')}>
                      Create account
                    </button>
                    <button type="button" className="ghost-button wide" onClick={() => openAuthModal('login')}>
                      I already have an account
                    </button>
                  </div>
                  <p className="status-line">{authStatus || 'Open the modal only when the user decides to continue.'}</p>
                </>
              )}
            </section>

            <section className="dashboard-card">
              <div className="card-topline">
                <span>Outfit analysis</span>
              </div>

              <form className="stack-form" onSubmit={handleAnalyzeSubmit}>
                <label>
                  <span>Gender</span>
                  <select name="gender" value={analyzeForm.gender} onChange={handleAnalyzeFieldChange}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </label>
                <label>
                  <span>Style</span>
                  <input name="style" value={analyzeForm.style} onChange={handleAnalyzeFieldChange} placeholder="minimal, edgy, modest, luxe" />
                </label>
                <label>
                  <span>Occasion</span>
                  <input name="occasion" value={analyzeForm.occasion} onChange={handleAnalyzeFieldChange} placeholder="office, dinner, travel" />
                </label>
                <button type="submit" className="solid-button wide" disabled={busy.analyze}>
                  {busy.analyze ? 'Analyzing...' : 'Generate outfit plan'}
                </button>
              </form>

              {analyzeResult ? (
                <div className="result-block">
                  <p className="result-summary">{analyzeResult.summary}</p>
                  <div className="mini-grid">
                    <span>Top: {analyzeResult.outfit?.top || '—'}</span>
                    <span>Bottom: {analyzeResult.outfit?.bottom || '—'}</span>
                    <span>Footwear: {analyzeResult.outfit?.footwear || '—'}</span>
                    <span>Outerwear: {analyzeResult.outfit?.outerwear || '—'}</span>
                  </div>
                  <div className="tag-row">
                    {(analyzeResult.colors || []).map((item) => (
                      <span key={item} className="tag">{item}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="dashboard-card">
              <div className="card-topline">
                <span>Image generation</span>
                {user?.plan !== 'pro' ? (
                  <button type="button" className="ghost-button small" onClick={handleUpgrade} disabled={!user || busy.billing || !config.paymentEnabled}>
                    {busy.billing ? 'Opening...' : 'Upgrade to Pro'}
                  </button>
                ) : null}
              </div>

              <form className="stack-form" onSubmit={handleImageSubmit}>
                <label>
                  <span>Prompt</span>
                  <textarea name="prompt" value={imageForm.prompt} onChange={handleImageFieldChange} rows="5" placeholder="Describe the outfit and visual mood" />
                </label>
                <button type="submit" className="solid-button wide" disabled={busy.image}>
                  {busy.image ? 'Rendering...' : 'Create AI image'}
                </button>
              </form>

              {imageResult ? (
                <div className="image-frame">
                  <img src={getImageSource(imageResult)} alt="Generated outfit" />
                </div>
              ) : (
                <div className="image-placeholder">Generated look preview will appear here.</div>
              )}

              <p className="status-line">{studioStatus || 'Free users get one image. Pro unlocks unlimited generations.'}</p>
            </section>
          </div>
        </section>

        <section id="shop" className="section-block">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Affiliate shop</p>
              <h3>{selectedBrand} inspired picks that keep the mood consistent.</h3>
            </div>
            <button type="button" className="ghost-button small" onClick={() => applyStarterLook(selectedStarter)}>
              Sync shop with starter look
            </button>
          </div>

          <div className="shop-tools-row">
            <label className="shop-search-field">
              <span>Search picks</span>
              <input
                type="search"
                value={shopSearch}
                onChange={(event) => setShopSearch(event.target.value)}
                placeholder="Search by product, brand, or vibe"
              />
            </label>
            <div className="shop-category-rail">
              {visibleCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? 'shop-filter-chip active' : 'shop-filter-chip'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {recommendedProducts.length ? (
            <section className="recommendation-shell">
              <div className="section-heading split-heading compact-heading">
                <div>
                  <p className="eyebrow">Recommended now</p>
                  <h3>Best matches for the current style direction.</h3>
                </div>
              </div>
              <div className="recommendation-grid">
                {recommendedProducts.map((item) => (
                  <article key={`recommended-${item.id}`} className="recommendation-card">
                    <span className="shop-meta">{item.brandLabel}</span>
                    <h4>{item.name}</h4>
                    <p>{item.descriptor}</p>
                    <div className="recommendation-tags">
                      <span className="signal-pill">{item.category}</span>
                      <span className="signal-pill">{selectedStarter.style}</span>
                    </div>
                    <a href={item.link} target="_blank" rel="noreferrer">Open recommended pick</a>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="shop-grid">
            {filteredShopItems.map((item) => (
              <article key={item.id} className="shop-card">
                <img src={item.image} alt={item.name} />
                <div>
                  <span className="shop-meta">{item.brandLabel}</span>
                  <h4>{item.name}</h4>
                  <p className="shop-description">{item.descriptor}</p>
                  <div className="recommendation-tags compact-tags">
                    <span className="signal-pill">{item.category}</span>
                  </div>
                  <a href={item.link} target="_blank" rel="noreferrer">Open product</a>
                </div>
              </article>
            ))}
          </div>

          {!filteredShopItems.length ? (
            <p className="status-line centered">No products match this filter yet. Try another category or search term.</p>
          ) : null}

          {shopStatus ? <p className="status-line centered">{shopStatus}</p> : null}
        </section>

        <section className="section-block trust-shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">Trust and momentum</p>
              <h3>People stay when the page feels loved, clear, and socially validated.</h3>
            </div>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.author} className="testimonial-card">
                <p>“{item.quote}”</p>
                <strong>{item.author}</strong>
              </article>
            ))}
          </div>

          <div className="faq-grid">
            {faqItems.map((item) => (
              <details key={item.question} className="faq-card">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section-block final-cta-shell">
          <div className="final-cta-card">
            <p className="eyebrow">Ready to convert better</p>
            <h3>Lead with fashion energy, then let the backend do its work.</h3>
            <p>
              The page now nudges users from curiosity into action. Next, the best upgrade is adding real try-on examples and moving admin out of the public landing experience.
            </p>
            <div className="hero-actions compact">
              <a href="#studio" className="solid-button">Open studio now</a>
              <a href="#shop" className="ghost-button">Browse product picks</a>
            </div>
          </div>
        </section>

      </main>

      {isAuthModalOpen ? (
        <div className="auth-modal-backdrop" role="presentation" onClick={closeAuthModal}>
          <section
            className="auth-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={authMode === 'register' ? 'Create account' : 'Login'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-topline">
              <span>{authMode === 'register' ? 'Create account' : 'Access your account'}</span>
              <div className="mode-switch">
                <button
                  type="button"
                  className={authMode === 'register' ? 'mode-chip active' : 'mode-chip'}
                  onClick={() => setAuthMode('register')}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={authMode === 'login' ? 'mode-chip active' : 'mode-chip'}
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
              </div>
            </div>

            <div className="auth-modal-copy">
              <h4>{selectedStarter.label} is already prepared for you.</h4>
              <p>Sign in once, then continue with the selected brand, style, and prompt already loaded into the studio.</p>
            </div>

            <div className="auth-benefit-strip">
              {authBenefits.map((item) => (
                <span key={item} className="auth-benefit-pill">{item}</span>
              ))}
            </div>

            <form className="stack-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' ? (
                <label>
                  <span>Name</span>
                  <input name="name" value={authForm.name} onChange={handleAuthFieldChange} placeholder="Abdumutalib" />
                </label>
              ) : null}
              <label>
                <span>Email</span>
                <input name="email" type="email" value={authForm.email} onChange={handleAuthFieldChange} placeholder="you@example.com" />
              </label>
              <label>
                <span>Password</span>
                <input name="password" type="password" value={authForm.password} onChange={handleAuthFieldChange} placeholder="Minimum 8 characters" />
              </label>
              <button type="submit" className="solid-button wide" disabled={busy.auth}>
                {busy.auth ? 'Please wait...' : authMode === 'register' ? 'Create account' : 'Login'}
              </button>
            </form>

            <div className="auth-modal-footer">
              <p className="status-line">{authStatus || 'Create the account once, then the style plan and image prompt below are already prepared.'}</p>
              <button type="button" className="ghost-button small" onClick={closeAuthModal}>
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="sticky-conversion-bar">
        <div>
          <span className="sticky-label">DressAI conversion flow</span>
          <strong>{generatedImageUrl ? 'Result ready. Push them to shop or upgrade.' : 'Photo upload + starter look are ready.'}</strong>
        </div>
        <div className="sticky-actions">
          <a href="#studio" className="solid-button small">Open studio</a>
          <a href="#shop" className="ghost-button small">Browse picks</a>
        </div>
      </div>
    </div>
  )
}

export default App

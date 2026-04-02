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
  const [busy, setBusy] = useState({ auth: false, analyze: false, image: false, billing: false })

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
      return
    }

    loadAdminPanel(token)
  }, [token, user?.isAdmin])

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

    try {
      const [statsData, usersData] = await Promise.all([
        apiRequest('/admin/stats', {}, authToken),
        apiRequest('/admin/users', {}, authToken),
      ])

      setAdminStats(statsData.stats || null)
      setAdminUsers(Array.isArray(usersData.users) ? usersData.users : [])
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
            {user?.isAdmin ? <a href="#admin" className="ghost-button">Admin</a> : null}
            <a href="#shop" className="solid-button">Shop Picks</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="hero-kicker">AI styling, visual outfit generation, premium upsell</p>
            <h2>Create looks, render images, and convert them into products.</h2>
            <p className="hero-text">
              This web layer sits on top of your existing DressAI backend and gives you a public-facing landing page plus a working customer studio.
            </p>

            <div className="hero-actions">
              <a href="#auth" className="solid-button">Start Free</a>
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
            <div className="panel-badge">Live backend connection</div>
            <div className="panel-line">
              <span>API</span>
              <strong>{API_BASE_URL}</strong>
            </div>
            <div className="panel-line">
              <span>Payments</span>
              <strong>{config.paymentEnabled ? 'Stripe ready' : 'Not configured yet'}</strong>
            </div>
            <div className="panel-line">
              <span>Auth</span>
              <strong>{config.authEnabled ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div className="panel-preview">
              <p>Sample studio command</p>
              <code>Warm beige blazer, relaxed trousers, luxe sneakers, editorial lighting</code>
            </div>
          </aside>
        </div>
      </header>

      <main>
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

          <div className="studio-grid">
            <section id="auth" className="dashboard-card auth-card">
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

              <p className="status-line">{authStatus || 'Use this panel to create a web customer flow on top of your backend.'}</p>

              {user ? (
                <div className="user-summary">
                  <strong>{user.name}</strong>
                  <span>Plan: {user.plan}</span>
                  <span>Remaining generations: {user.remainingGenerations === null ? 'Unlimited' : user.remainingGenerations}</span>
                </div>
              ) : null}
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
              <h3>Use your backend products as a ready-made commerce block.</h3>
            </div>
          </div>

          <div className="shop-grid">
            {shopItems.map((item) => (
              <article key={item.id} className="shop-card">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <a href={item.link} target="_blank" rel="noreferrer">Open product</a>
                </div>
              </article>
            ))}
          </div>

          {shopStatus ? <p className="status-line centered">{shopStatus}</p> : null}
        </section>

        {user?.isAdmin ? (
          <section id="admin" className="section-block admin-shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Admin panel</p>
                <h3>Live overview of users, plans, and generation activity.</h3>
              </div>
              <button type="button" className="ghost-button small" onClick={() => loadAdminPanel()}>
                Refresh admin data
              </button>
            </div>

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

            <p className="status-line centered">{adminStatus || 'Admin email access is controlled by ADMIN_EMAIL or ADMIN_EMAILS in the backend env.'}</p>
          </section>
        ) : null}
      </main>
    </div>
  )
}

export default App

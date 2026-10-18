import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import "./Home.css"; 
import { FaCode, FaLaptopCode, FaBuilding, FaRocket, FaExternalLinkAlt } from "react-icons/fa"; 
// Optional: Import toast if you want a nice popup, otherwise we use alert
// import { toast } from "react-toastify"; 

const Home = ({ toggleSidebar, isLoggedIn }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Every company in the question bank, with question counts, for the landing page.
  const [catalog, setCatalog] = useState(null); // { totalQuestions, companies: [{ name, count }] }
  const [catalogError, setCatalogError] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);

  // Hooks for URL handling
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!searchQuery) return; 

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/api/questions?search=${encodeURIComponent(searchQuery)}`
        );
        setQuestions(response.data);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchQuery]);

  // Load the company list once for the landing page (again only if the user presses Retry).
  useEffect(() => {
    if (searchQuery || catalog) return undefined;
    let alive = true;
    axios
      .get(`${API_URL}/api/companies`)
      .then((res) => alive && setCatalog(res.data))
      .catch((err) => {
        console.error("Error fetching companies:", err);
        if (alive) setCatalogError(true);
      });
    return () => {
      alive = false;
    };
  }, [searchQuery, catalog, catalogAttempt]);

  const scrollToCompanies = () => {
    document.getElementById("companies")?.scrollIntoView({ behavior: "smooth" });
  };

  // --- HELPER: Handle clicking a Company Tag ---
  const handleCompanyClick = (companyName) => {
    navigate(`/?search=${companyName}`);
  };

  // --- NEW FUNCTION: Handle "Solve Problem" Click ---
  const handleSolveClick = (questionId) => {
    if (!isLoggedIn) {
      // 1. Alert the user they need to login
      alert("You must be logged in to view this problem!");
      // 2. Redirect to Login page
      navigate("/login");
    } else {
      // 3. If logged in, go to the Question Detail page
      navigate(`/question/${questionId}`);
    }
  };

  // --- RENDER: Search Results View ---
  if (searchQuery) {
    return (
      <div className="home-container search-mode">
        <div className="container pt-5">
          
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Results for: <span className="text-primary">"{searchQuery}"</span></h2>
            <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">Clear</Link>
          </div>

          {/* Loading / Error States */}
          {loading && <div className="text-center py-5 text-muted">Searching database...</div>}
          {error && <div className="text-center py-5 text-danger">{error}</div>}
          
          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-5">
              <h3>No questions found.</h3>
              <p className="text-muted">Search matches the start of a company name or question title, like &ldquo;Amazon&rdquo; or &ldquo;Two Sum&rdquo;.</p>
            </div>
          )}

          {/* QUESTIONS GRID */}
          <div className="questions-grid">
            {questions.map((q) => (
              <div key={q._id} className="question-card">
                
                {/* Top Row: Difficulty & Topic */}
                <div className="card-header-custom">
                  <span className={`badge-custom ${q.difficulty?.toLowerCase()}`}>
                    {q.difficulty}
                  </span>
                  <span className="topic-text">{q.topic}</span>
                </div>
                
                {/* Question Title */}
                <h3 className="question-title">{q.title}</h3>
                
                {/* Company Tags (Clickable) */}
                <div className="companies-row">
                  {q.companies && q.companies.slice(0, 3).map((company, index) => (
                    <span 
                      key={index} 
                      className="company-badge"
                      onClick={() => handleCompanyClick(company)}
                      title={`See all ${company} questions`}
                    >
                      <FaBuilding className="me-1"/> {company}
                    </span>
                  ))}
                </div>

                {/* THE SOLVE BUTTON - NOW WITH LOGIN CHECK */}
                <button 
                  onClick={() => handleSolveClick(q._id)} 
                  className="solve-btn-full"
                  style={{ border: 'none', cursor: 'pointer' }} // Inline style to make button look correct
                >
                  Solve Problem <FaExternalLinkAlt className="ms-2" size={14} />
                </button>

              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER: Default Landing Page ---
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master Your <span className="highlight">Coding assesment</span></h1>
          <p className="hero-subtitle">Curated questions from top tech giants.</p>
          <div className="hero-buttons">
             {!isLoggedIn ? (
               <>
                 <Link to="/login" className="btn-primary hero-btn">Login to Practice</Link>
                 <button type="button" onClick={scrollToCompanies} className="btn-secondary hero-btn">
                   Browse Companies
                 </button>
               </>
             ) : (
               <button type="button" onClick={scrollToCompanies} className="btn-primary hero-btn">
                 Browse Companies
               </button>
             )}
          </div>
        </div>

         {/* Floating Icons Animation */}
         <div className="hero-visuals">
          <div className="floating-icon icon-1"><FaCode /></div>
          <div className="floating-icon icon-2"><FaLaptopCode /></div>
          <div className="floating-icon icon-3">{`{ }`}</div>
        </div>
      </section>

      {/* Stats Strip: live counts from the question bank */}
      <div className="stats-strip">
        <div className="stat-item">
          <h2>{catalog ? catalog.totalQuestions : "–"}</h2>
          <p>Questions</p>
        </div>
        <div className="stat-item">
          <h2>{catalog ? catalog.companies.length : "–"}</h2>
          <p>Companies</p>
        </div>
        <div className="stat-item">
          <h2>4</h2>
          <p>AI Coach Modes</p>
        </div>
      </div>

      {/* Every company in the question bank */}
      <section className="companies-section" id="companies">
        <h2 className="section-title">Browse by Company</h2>
        <p className="section-subtitle">Pick a company to see every question in its online assessment.</p>

        {!catalog && !catalogError && <p className="companies-status">Loading companies...</p>}
        {catalogError && (
          <p className="companies-status">
            Could not load companies. The server may be waking up, so try again in a minute.{" "}
            <button
              type="button"
              className="retry-link"
              onClick={() => {
                setCatalogError(false);
                setCatalogAttempt((n) => n + 1);
              }}
            >
              Retry
            </button>
          </p>
        )}
        {catalog && catalog.companies.length === 0 && (
          <p className="companies-status">No questions have been added yet.</p>
        )}

        {catalog && catalog.companies.length > 0 && (
          <div className="company-grid">
            {catalog.companies.map(({ name, count }) => (
              <Link key={name} to={`/topic/${encodeURIComponent(name)}`} className="company-card">
                <FaBuilding className="company-icon" aria-hidden="true" />
                <span>
                  <span className="company-name">{name}</span>
                  <span className="company-count">
                    {count} {count === 1 ? "question" : "questions"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

       {/* Features */}
       <section className="features-section">
        <h2 className="section-title">Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaBuilding /></div>
            <h3>Company-Specific</h3>
            <p>Don't just practice randomly. Solve questions actually asked by your dream companies.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaCode /></div>
            <h3>Curated Problems</h3>
            <p>From Array manipulation to complex Graph algorithms, cover every topic effectively.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaRocket /></div>
            <h3>Boost Confidence</h3>
            <p>Simulate real assesment scenarios with our clean, distraction-free interface.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
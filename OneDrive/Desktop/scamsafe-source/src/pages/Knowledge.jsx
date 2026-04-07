import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, BookOpen, Clock, ChevronRight, ArrowLeft, Database, Users, FileText, Search, ExternalLink } from 'lucide-react';
import { getBreaches, getArticles, getArticleBySlug } from '../utils/api';

const SEVERITY_COLORS = {
  CRITICAL: 'text-red-400 bg-red-500/20 border-red-500/30',
  HIGH: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  LOW: 'text-green-400 bg-green-500/20 border-green-500/30',
};

const CATEGORY_LABELS = {
  your_rights: 'Your Rights',
  how_data_travels: 'How Data Travels',
  scam_tactics: 'Scam Tactics',
  how_to_guides: 'How-To Guides',
  government: 'Government',
  myth_busting: 'Myth Busting',
  general: 'General',
};

const CATEGORY_ICONS = {
  your_rights: Shield,
  how_data_travels: Database,
  scam_tactics: AlertTriangle,
  how_to_guides: FileText,
  government: Users,
  myth_busting: Search,
  general: BookOpen,
};

function formatRecords(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)} crore`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)} lakh`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString();
}

export default function Knowledge() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [tab, setTab] = useState('breaches');
  const [breaches, setBreaches] = useState([]);
  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (slug) {
      getArticleBySlug(slug).then(data => {
        setArticle(data);
        setLoading(false);
      });
    } else {
      Promise.all([getBreaches(), getArticles()]).then(([b, a]) => {
        setBreaches(b.breaches || []);
        setArticles(a.articles || []);
        setLoading(false);
      });
    }
  }, [slug]);

  // Single article view
  if (slug && article) {
    const CatIcon = CATEGORY_ICONS[article.category] || BookOpen;
    return (
      <div className="flex flex-col gap-4 pb-8">
        <button
          onClick={() => navigate('/knowledge')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Knowledge Center
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30 font-medium flex items-center gap-1">
              <CatIcon size={10} /> {CATEGORY_LABELS[article.category] || article.category}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock size={10} /> {article.read_time_minutes} min read
            </span>
          </div>
          <h1 className="text-xl font-bold mb-4">{article.title}</h1>
          <div className="glass-card p-5">
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>
          <div className="mt-6 glass-card p-4 border-accent-orange/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-accent-orange" />
              <span className="text-sm font-bold">Protect Your Data</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              ScamSafe scans 72+ databases and sends legal DPDP Act removal requests on your behalf. Free scan — no payment needed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="glow-button-orange !py-2 !px-4 !text-xs flex items-center gap-1.5"
            >
              <Shield size={12} /> Scan My Number Free <ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (slug && !article && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <p className="text-gray-400">Article not found.</p>
        <button onClick={() => navigate('/knowledge')} className="text-accent-orange text-sm hover:underline">
          Back to Knowledge Center
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-2xl font-bold mb-2">Knowledge Center</h1>
        <p className="text-gray-400 text-sm">Indian data breaches, privacy education, and your DPDP Act rights.</p>
      </motion.div>

      {/* Tab toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border mx-auto"
      >
        <button
          onClick={() => setTab('breaches')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            tab === 'breaches' ? 'bg-red-500/20 text-red-400' : 'text-gray-500'
          }`}
        >
          <AlertTriangle size={14} /> Breaches
        </button>
        <button
          onClick={() => setTab('articles')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            tab === 'articles' ? 'bg-accent-purple/20 text-accent-purple' : 'text-gray-500'
          }`}
        >
          <BookOpen size={14} /> Articles
        </button>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
        </div>
      )}

      {/* Breaches tab */}
      {!loading && tab === 'breaches' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 text-center">
            {breaches.length} major Indian data breaches tracked. Your data may be in these.
          </p>
          {breaches.map((b, idx) => {
            const sevClass = SEVERITY_COLORS[b.severity] || SEVERITY_COLORS.MEDIUM;
            let dataTypes = [];
            try { dataTypes = JSON.parse(b.data_types || '[]'); } catch { dataTypes = []; }
            return (
              <motion.div
                key={b.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{b.company_name}</h3>
                    <p className="text-[10px] text-gray-500">{b.company_domain}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sevClass}`}>
                    {b.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{b.description}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] bg-dark-border px-2 py-0.5 rounded-full text-gray-300">
                    <Database size={10} className="inline mr-1" />{formatRecords(b.records_affected)} records
                  </span>
                  <span className="text-[10px] bg-dark-border px-2 py-0.5 rounded-full text-gray-300">
                    <Clock size={10} className="inline mr-1" />{b.breach_date ? new Date(b.breach_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown'}
                  </span>
                  {dataTypes.slice(0, 3).map(dt => (
                    <span key={dt} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">{dt}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
          {breaches.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No breach data available yet.</p>
          )}
        </div>
      )}

      {/* Articles tab */}
      {!loading && tab === 'articles' && (
        <div className="flex flex-col gap-3">
          {articles.map((a, idx) => {
            const CatIcon = CATEGORY_ICONS[a.category] || BookOpen;
            return (
              <motion.div
                key={a.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                onClick={() => navigate(`/knowledge/${a.slug}`)}
                className="glass-card p-4 cursor-pointer hover:border-accent-purple/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent-purple/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CatIcon size={16} className="text-accent-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1">{a.title}</h3>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{a.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-accent-purple font-medium">
                        {CATEGORY_LABELS[a.category] || a.category}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {a.read_time_minutes} min
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })}
          {articles.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No articles available yet.</p>
          )}
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 border-accent-orange/30 text-center"
      >
        <Shield size={24} className="text-accent-orange mx-auto mb-2" />
        <h3 className="font-bold text-sm mb-1">Is Your Data in These Breaches?</h3>
        <p className="text-[11px] text-gray-400 mb-3">
          Free scan checks 72+ databases. Takes 15 seconds.
        </p>
        <button
          onClick={() => navigate('/')}
          className="glow-button-orange !py-2.5 !px-6 !text-sm"
        >
          Scan My Number Free
        </button>
      </motion.div>
    </div>
  );
}

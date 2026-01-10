'use client';

import { useState, useEffect } from 'react';
import { 
  generateInfographic, 
  getInfographicStyles, 
  InfographicResponse, 
  InfographicRequest 
} from '@/services/api';
import Button from '@/components/ui/Button';
import { LoadingIcon, SparkleIcon, ImageIcon, RefreshIcon } from '@/components/ui/Icons';
import IconButton from '@/components/ui/IconButton';

export default function InfographicGenerator() {
  const [request, setRequest] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('modern');
  const [docType, setDocType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<{style: string, description: string}[]>([]);
  const [result, setResult] = useState<InfographicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load styles on mount
    getInfographicStyles().then(setStyles).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!request.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const payload: InfographicRequest = {
        request,
        topic: topic || undefined,
        style: style as any,
        doc_type: docType === 'all' ? undefined : docType as any,
      };
      
      const data = await generateInfographic(payload);
      setResult(data);
      
      if (data.error_message) {
        setError(data.error_message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate infographic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Infographic Generator</h1>
          <p className="text-[var(--foreground-muted)]">Turn your meetings and documents into visual insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                What do you want to visualize?
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="e.g. key takeaways from Q1 Marketing meeting..."
                className="w-full h-32 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Specific topic to search for"
                className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all appearance-none"
                >
                  {styles.map(s => (
                    <option key={s.style} value={s.style}>
                      {s.style.charAt(0).toUpperCase() + s.style.slice(1)}
                    </option>
                  ))}
                  {styles.length === 0 && <option value="modern">Modern</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                  Source
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all appearance-none"
                >
                  <option value="all">All Sources</option>
                  <option value="meeting">Meetings</option>
                  <option value="document">Documents</option>
                  <option value="email">Emails</option>
                  <option value="note">Notes</option>
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={loading || !request.trim()}
              fullWidth
              className="mt-4"
            >
              {loading ? (
                <>
                  <LoadingIcon className="w-5 h-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparkleIcon className="w-5 h-5 mr-2" />
                  Generate Infographic
                </>
              )}
            </Button>
          </div>
          
          {/* Tips Panel */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <SparkleIcon className="w-4 h-4 text-yellow-500" />
              Pro Tips
            </h3>
            <ul className="text-sm text-[var(--foreground-muted)] space-y-2 list-disc pl-4">
              <li>Be specific about what metrics you want to see.</li>
              <li>Filter by 'Meeting' to focus on verbal decisions.</li>
              <li>Try 'Corporate' style for formal presentations.</li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {error && !result && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl mb-6">
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-[var(--foreground-muted)] border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--surface-subtle)]">
              <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-medium">Ready to create</p>
              <p className="text-sm opacity-60">Enter a prompt to generate your first infographic</p>
            </div>
          )}
          
          {loading && (
             <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
               <LoadingIcon className="w-12 h-12 text-[var(--primary)]" />
               <p className="text-[var(--foreground-secondary)] animate-pulse">Analyzing potential designs...</p>
             </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Image Result */}
              <div className="glass p-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {result.image ? (
                   <img 
                     src={`data:image/png;base64,${result.image}`} 
                     alt={result.structured_data.headline}
                     className="w-full h-auto rounded-2xl"
                   />
                ) : result.image_url ? (
                  <img 
                    src={result.image_url} 
                    alt={result.structured_data.headline}
                    className="w-full h-auto rounded-2xl"
                  />
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center bg-[var(--surface-subtle)] rounded-2xl text-[var(--foreground-muted)] p-8 text-center">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium">Image generation unavailable</p>
                    <p className="text-sm mt-2">{error || "The visual could not be generated, but here is the data:"}</p>
                  </div>
                )}
              </div>

              {/* Data Extraction View */}
              <div className="glass p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Extracted Data</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-2xl font-bold text-[var(--primary)]">{result.structured_data.headline}</h4>
                    {result.structured_data.subtitle && (
                      <p className="text-lg text-[var(--foreground-secondary)]">{result.structured_data.subtitle}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {result.structured_data.stats.map((stat, i) => (
                      <div key={i} className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                        <div className="text-2xl mb-1">{stat.icon || '📊'}</div>
                        <div className="text-xl font-bold text-[var(--foreground)]">{stat.value}</div>
                        <div className="text-sm text-[var(--foreground-muted)]">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {result.structured_data.key_points && (
                    <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)]">
                      <h5 className="font-medium text-[var(--foreground)] mb-3">Key Takeaways</h5>
                      <ul className="space-y-2">
                        {result.structured_data.key_points.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground-secondary)]">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

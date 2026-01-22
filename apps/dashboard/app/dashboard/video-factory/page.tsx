'use client';

import { useState } from 'react';
import { lusitana } from '@/app/ui/fonts';
import { VideoCameraIcon, SparklesIcon, CogIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import clsx from 'clsx';

export default function Page() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'manual' | 'semi-auto'>('manual');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const steps = [
    { name: 'Generate Script', icon: SparklesIcon, description: 'AI writes the script based on your topic.' },
    { name: 'Assemble Video', icon: CogIcon, description: 'Engine renders the video with assets.' },
    { name: 'Finalize', icon: CheckCircleIcon, description: 'Log to sheets and upload final output.' },
  ];

  const handleFullFlow = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/jobs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      alert('Generation started! Check the jobs list for progress.');
    } catch (err) {
      console.error(err);
      alert('Failed to start generation.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async (stepIndex: number) => {
    setLoading(true);
    try {
      if (stepIndex === 0) {
        const res = await fetch('/api/proxy/jobs/step-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        });
        const data = await res.json();
        setJobId(data.jobId);
        setScriptId(data.script.id);
        setCurrentStep(1);
      } else if (stepIndex === 1) {
        const res = await fetch(`/api/proxy/jobs/${jobId}/step-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scriptId }),
        });
        const data = await res.json();
        setVideoId(data.videoMetadata.id);
        setCurrentStep(2);
      } else if (stepIndex === 2) {
        await fetch(`/api/proxy/jobs/${jobId}/step-finalize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId }),
        });
        setCurrentStep(3); // All done
      }
    } catch (err) {
      console.error(err);
      alert('Step failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex items-center gap-4 mb-8">
        <VideoCameraIcon className="w-10 h-10 text-blue-600" />
        <h1 className={`${lusitana.className} text-3xl font-bold`}>Video Factory</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Video Topic</label>
          <input
            type="text"
            placeholder="e.g., The future of AI in 2026..."
            className="w-full p-4 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-6"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMode('manual')}
              className={clsx(
                'flex-1 p-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 border-2',
                mode === 'manual' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
              )}
            >
              <SparklesIcon className="w-6 h-6" />
              <span>Manual Flow</span>
            </button>
            <button
              onClick={() => setMode('semi-auto')}
              className={clsx(
                'flex-1 p-4 rounded-xl font-medium transition-all flex flex-col items-center gap-2 border-2',
                mode === 'semi-auto' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
              )}
            >
              <CogIcon className="w-6 h-6" />
              <span>Semi-Auto</span>
            </button>
          </div>

          {mode === 'manual' ? (
            <Button
              className="w-full py-6 text-lg rounded-xl flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none"
              onClick={handleFullFlow}
              disabled={loading || !topic}
            >
              {loading ? 'Processing...' : (
                <>
                  Generate Full Video <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </Button>
          ) : (
            <p className="text-sm text-gray-500 text-center italic">
              Use the stepper on the right to control each stage of the production.
            </p>
          )}
        </div>

        {/* Workflow Status Panel */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Production Workflow</h2>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = mode === 'semi-auto' && currentStep === index;
              const isCompleted = currentStep > index;
              const isFullAuto = mode === 'manual' && loading;

              return (
                <div key={step.name} className="flex gap-6 items-start relative pb-4">
                  {index !== steps.length - 1 && (
                    <div className={clsx(
                      "absolute left-6 top-10 w-0.5 h-full -ml-px",
                      isCompleted ? "bg-blue-500" : "bg-gray-200"
                    )} />
                  )}

                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300",
                    isCompleted ? "bg-blue-500 text-white shadow-lg shadow-blue-200" :
                    isActive ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : <StepIcon className="w-6 h-6" />}
                  </div>

                  <div className="flex-1">
                    <h3 className={clsx(
                      "font-bold text-lg",
                      isCompleted || isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400"
                    )}>{step.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{step.description}</p>

                    {isActive && (
                      <Button
                        size="sm"
                        onClick={() => handleStep(index)}
                        disabled={loading || !topic}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 rounded-lg"
                      >
                        {loading ? 'Running...' : `Start ${step.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {currentStep === 3 && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-xl flex items-center gap-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">Production Complete!</p>
                  <p className="text-sm text-green-700">Your video is ready and logged to Google Sheets.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

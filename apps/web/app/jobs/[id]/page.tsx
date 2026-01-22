'use client';

import * as React from 'react';
import useSWR from 'swr';
import { apiClient } from '../../lib/api-client';
import { VideoJob } from '../../lib/types';
import { ArrowLeft, Video, FileText, CheckCircle, AlertTriangle, Clock, Layers, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: job, error } = useSWR<VideoJob>(`/jobs/${id}`, fetcher, { refreshInterval: 3000 });

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600">
      Error loading job details.
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
      Loading job details...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Nav */}
            <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            {/* Title Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{job.script?.topic?.content || job.script?.title || 'Untitled Job'}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">ID: {job.id}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(job.createdAt), 'PPpp')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {job.status === 'FAILED' && (
                        <button
                            onClick={async () => {
                                try {
                                    await apiClient.post(`/jobs/${job.id}/retry`);
                                    alert('Retry started!');
                                } catch (e) {
                                    alert('Retry failed.');
                                }
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Retry Generation
                        </button>
                    )}
                    <StatusBadge status={job.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Script & Scenes */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Script Overview */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" /> Script Overview
                        </h2>
                        <div className="prose prose-sm max-w-none text-gray-600">
                            <p><strong>Title:</strong> {job.script?.title}</p>
                            <p><strong>Description:</strong> {job.script?.description || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Scenes List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" /> Scenes
                        </h2>
                        <div className="space-y-4">
                           {job.script?.scenes?.map((scene: any, idx: number) => (
                               <div key={idx} className="border-l-4 border-blue-100 pl-4 py-1">
                                   <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Scene {idx + 1}</span>
                                        <span>{scene.duration}s</span>
                                   </div>
                                   <p className="text-gray-800 font-medium">{scene.content || scene.text}</p>
                                   <p className="text-xs text-gray-500 mt-1">{scene.visual_description || 'No visual description'}</p>
                               </div>
                           ))}
                           {!job.script?.scenes?.length && <p className="text-gray-400 italic">No scenes generated yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Video Preview & Metadata */}
                <div className="space-y-6">
                    {/* Video Player */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Video className="w-5 h-5 text-green-600" /> Preview
                        </h2>
                        {job.outputUrl ? (
                            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative group">
                                <video
                                    src={job.outputUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                    poster={job.thumbnailUrl || undefined}
                                />
                            </div>
                        ) : (
                            <div className="aspect-[9/16] bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                {job.status === 'FAILED' ? (
                                    <>
                                        <AlertTriangle className="w-10 h-10 mb-2 text-red-400" />
                                        <span>Generation Failed</span>
                                    </>
                                ) : (
                                    <>
                                        <Video className="w-10 h-10 mb-2" />
                                        <span>Video processing...</span>
                                    </>
                                )}
                            </div>
                        )}
                        {job.outputUrl && (
                            <a
                                href={job.outputUrl}
                                target="_blank"
                                className="block mt-4 w-full text-center bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
                            >
                                Download Video
                            </a>
                        )}
                    </div>

                    {/* Metadata Card */}
                    {job.error && (
                        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                             <h3 className="text-red-800 font-semibold text-sm mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Error Log
                             </h3>
                             <pre className="text-xs text-red-600 whitespace-pre-wrap">{job.error}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        COMPLETED: 'bg-green-100 text-green-700',
        PROCESSING: 'bg-purple-100 text-purple-700',
        FAILED: 'bg-red-100 text-red-700',
        PENDING: 'bg-gray-100 text-gray-700',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.PENDING}`}>
            {status}
        </span>
    );
}

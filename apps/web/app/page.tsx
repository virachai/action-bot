'use client';

import useSWR from 'swr';
import { apiClient } from './lib/api-client';
import { JobStats, VideoJob } from './lib/types';
import { Activity, CheckCircle, Clock, AlertCircle, PlayCircle, FileVideo } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data);

export default function Dashboard() {
  const { data: stats } = useSWR<JobStats>('/jobs/stats', fetcher, { refreshInterval: 5000 });
  const { data: jobs } = useSWR<VideoJob[]>('/jobs', fetcher, { refreshInterval: 5000 });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">🏭 Auto-Short Factory</h1>
            <p className="text-gray-500 mt-1">Real-time production monitoring</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors cursor-not-allowed opacity-75" title="Coming soon">
            + New Generation
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Jobs"
            value={stats?.total ?? '-'}
            icon={<Activity className="w-5 h-5 text-blue-600" />}
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            title="Completed"
            value={stats?.completed ?? '-'}
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            color="bg-green-50 text-green-700"
          />
          <StatCard
            title="Processing"
            value={stats?.processing ?? '-'}
            icon={<Clock className="w-5 h-5 text-purple-600" />}
            color="bg-purple-50 text-purple-700"
          />
          <StatCard
            title="Failed"
            value={stats?.failed ?? '-'}
            icon={<AlertCircle className="w-5 h-5 text-red-600" />}
            color="bg-red-50 text-red-700"
          />
        </div>

        {/* Recent Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Production Jobs</h2>
            <span className="text-sm text-gray-400">Auto-refreshing every 5s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Topic / Title</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!jobs ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading factory data...</td></tr>
                ) : jobs.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No jobs found in the system.</td></tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{job.script?.topic?.content || job.script?.title || 'Unknown Topic'}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{job.id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {job.script?.scenes ? `${job.script.scenes.length} Scenes` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-1">
                            Details <PlayCircle className="w-4 h-4" />
                         </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
            {status}
        </span>
    );
}

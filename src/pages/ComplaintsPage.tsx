import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Complaint {
  id: number;
  complaint_no: string;
  category_id: number;
  category_name: string;
  site_id: number;
  site_name: string;
  batch_id: number;
  batch_name: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  reported_by: number;
  reported_by_name: string;
  assigned_to: number;
  assigned_to_name: string;
  resolved_date: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface ComplaintStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent_pending: number;
}

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isSuperAdmin = user?.role_id === 1;
  const canEdit = hasPermission('COMPLAINTS', 'EDIT');

  const [formData, setFormData] = useState({
    category_id: '',
    subject: '',
    description: '',
    priority: 'MEDIUM' as const,
  });

  const [updateData, setUpdateData] = useState({
    status: '',
    assigned_to: '',
    resolution_notes: '',
    priority: '',
  });

  useEffect(() => {
    fetchComplaints();
    fetchCategories();
    if (isSuperAdmin) {
      fetchStats();
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints');
      setComplaints(response.data.complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/complaints/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/complaints/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      category_id: '',
      subject: '',
      description: '',
      priority: 'MEDIUM',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/complaints', formData);
      toast.success('Complaint submitted successfully');
      fetchComplaints();
      if (isSuperAdmin) fetchStats();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      assigned_to: complaint.assigned_to?.toString() || '',
      resolution_notes: complaint.resolution_notes || '',
      priority: complaint.priority,
    });
    setShowDetailModal(true);
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      await api.put(`/complaints/${selectedComplaint.id}`, updateData);
      toast.success('Complaint updated successfully');
      fetchComplaints();
      if (isSuperAdmin) fetchStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const handleCancelComplaint = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;

    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint cancelled successfully');
      fetchComplaints();
      if (isSuperAdmin) fetchStats();
    } catch (error) {
      console.error('Error cancelling complaint:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = filterStatus === 'ALL'
    ? complaints
    : complaints.filter((c) => c.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600 mt-1">
            {isSuperAdmin ? 'Manage all complaints' : 'Track your complaints'}
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Submit Complaint
        </button>
      </div>

      {/* Statistics - Super Admin Only */}
      {isSuperAdmin && stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Open</p>
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.in_progress}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Urgent Pending</p>
            <p className="text-2xl font-bold text-red-600">{stats.urgent_pending}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card p-4">
        <div className="flex gap-2 overflow-x-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredComplaints.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No complaints found</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(complaint)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.subject}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>#{complaint.complaint_no}</span>
                    {complaint.category_name && (
                      <span>• {complaint.category_name}</span>
                    )}
                    <span>• {new Date(complaint.created_at).toLocaleDateString()}</span>
                    {complaint.reported_by_name && (
                      <span>• By: {complaint.reported_by_name}</span>
                    )}
                    {complaint.assigned_to_name && (
                      <span>• Assigned to: {complaint.assigned_to_name}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {complaint.status === 'OPEN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelComplaint(complaint.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Cancel complaint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Submit New Complaint</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="input"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="input"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input"
                  rows={5}
                  placeholder="Provide detailed information about your complaint"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as any })
                  }
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Read-only details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Complaint No</p>
                  <p className="font-semibold">{selectedComplaint.complaint_no}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted By</p>
                  <p className="font-semibold">{selectedComplaint.reported_by_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedComplaint.category_name || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Subject</p>
                <p className="font-semibold text-lg">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {/* Super Admin can edit */}
              {canEdit && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-bold text-lg">Update Complaint</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={updateData.status}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, status: e.target.value })
                        }
                        className="input"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={updateData.priority}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, priority: e.target.value })
                        }
                        className="input"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={updateData.resolution_notes}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, resolution_notes: e.target.value })
                      }
                      className="input"
                      rows={4}
                      placeholder="Add resolution notes or updates..."
                    />
                  </div>
                </div>
              )}

              {selectedComplaint.resolution_notes && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Resolution Notes</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {selectedComplaint.resolution_notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {canEdit && (
                  <button onClick={handleUpdateComplaint} className="btn btn-primary">
                    Update Complaint
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

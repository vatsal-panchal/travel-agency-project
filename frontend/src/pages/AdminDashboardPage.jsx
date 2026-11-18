import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  CalendarCheck,
  CreditCard,
  Edit,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { packageApi } from '../api/packageApi';
import { enquiryApi } from '../api/enquiryApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Reveal } from '../components/ui/Reveal';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusStyles = {
  confirmed: 'border-moss/20 bg-moss/10 text-moss',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  resolved: 'border-moss/20 bg-moss/10 text-moss',
  contacted: 'border-sky-200 bg-sky-50 text-sky-700',
  success: 'border-moss/20 bg-moss/10 text-moss',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  refunded: 'border-ink/15 bg-ink/[0.06] text-ink-600',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${
      statusStyles[status] || statusStyles.pending
    }`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const Th = ({ children, className = '' }) => (
  <th
    className={`whitespace-nowrap px-5 py-3.5 text-left text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400 ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }) => (
  <td className={`px-5 py-4 align-middle text-[12px] text-ink-600 ${className}`}>{children}</td>
);

const defaultPackageForm = () => ({
  title: '',
  destination: '',
  description: '',
  price: 25000,
  durationDays: 5,
  totalSeats: 20,
  startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  category: 'beach',
  pickupLocation: 'Airport Arrival Terminal',
  images:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  inclusions: 'Luxury accommodation, Daily breakfast, Airport transfers, Guided sightseeing',
  exclusions: 'Airfare, Personal gratuities, Travel insurance',
  itineraryText:
    'Day 1: Arrival & Welcome Reception\nDay 2: Coastal Sightseeing\nDay 3: Island Excursion\nDay 4: Free Leisure & Sunset Cruise\nDay 5: Departure',
});

export const AdminDashboardPage = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState(defaultPackageForm);
  const [packageSaving, setPackageSaving] = useState(false);
  const [packageError, setPackageError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes, bookingsRes, pkgsRes, enquiriesRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getBookings(),
        packageApi.getAll({ limit: 50 }),
        enquiryApi.getAdminEnquiries(),
      ]);

      setStats(statsRes.data?.stats || null);
      setUsersList(usersRes.data?.users || []);
      setAdminBookings(bookingsRes.data?.bookings || []);
      setPackagesList(pkgsRes.data?.packages || []);
      setEnquiriesList(enquiriesRes.data?.enquiries || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
      setError(err.response?.data?.message || 'Operations data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const handleToggleBlock = async (userId) => {
    try {
      await adminApi.toggleBlockUser(userId);
      setUsersList((current) =>
        current.map((user) =>
          user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user access.');
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Delete this journey? This cannot be undone.')) return;
    try {
      await packageApi.delete(packageId);
      setPackagesList((current) =>
        current.filter((pkg) => (pkg._id || pkg.id) !== packageId)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete this package.');
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      await enquiryApi.updateStatus(enquiryId, newStatus);
      setEnquiriesList((current) =>
        current.map((enquiry) =>
          enquiry._id === enquiryId ? { ...enquiry, status: newStatus } : enquiry
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update the enquiry status.');
    }
  };

  const handleSavePackage = async (event) => {
    event.preventDefault();
    setPackageError('');

    try {
      setPackageSaving(true);

      const parsedItinerary = packageForm.itineraryText
        .split('\n')
        .filter((line) => line.trim())
        .map((line, index) => {
          const separator = line.indexOf(':');
          const title = separator >= 0 ? line.slice(0, separator).trim() : `Day ${index + 1}`;
          const details = separator >= 0 ? line.slice(separator + 1).trim() : line.trim();
          return { day: index + 1, title, details };
        });

      const payload = {
        title: packageForm.title,
        destination: packageForm.destination,
        description: packageForm.description,
        price: Number(packageForm.price),
        durationDays: Number(packageForm.durationDays),
        totalSeats: Number(packageForm.totalSeats),
        startDate: new Date(packageForm.startDate),
        category: packageForm.category,
        pickupLocation: packageForm.pickupLocation,
        images: packageForm.images.split(',').map((value) => value.trim()).filter(Boolean),
        inclusions: packageForm.inclusions.split(',').map((value) => value.trim()).filter(Boolean),
        exclusions: packageForm.exclusions.split(',').map((value) => value.trim()).filter(Boolean),
        itinerary: parsedItinerary,
      };

      if (editingPackageId) {
        await packageApi.update(editingPackageId, payload);
      } else {
        await packageApi.create(payload);
      }

      setPackageModalOpen(false);
      setEditingPackageId(null);
      setPackageForm(defaultPackageForm());
      await loadAllAdminData();
    } catch (err) {
      setPackageError(err.response?.data?.message || 'Failed to save this package.');
    } finally {
      setPackageSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingPackageId(null);
    setPackageForm(defaultPackageForm());
    setPackageError('');
    setPackageModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackageId(pkg._id || pkg.id);
    setPackageError('');
    setPackageForm({
      title: pkg.title || '',
      destination: pkg.destination || '',
      description: pkg.description || '',
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 1,
      totalSeats: pkg.totalSeats || 1,
      startDate: new Date(pkg.startDate).toISOString().split('T')[0],
      category: pkg.category || 'beach',
      pickupLocation: pkg.pickupLocation || '',
      images: (pkg.images || []).join(', '),
      inclusions: (pkg.inclusions || []).join(', '),
      exclusions: (pkg.exclusions || []).join(', '),
      itineraryText:
        (pkg.itinerary || [])
          .map((item) => `Day ${item.day}: ${item.title} — ${item.details}`)
          .join('\n') || 'Day 1: Arrival & check-in',
    });
    setPackageModalOpen(true);
  };

  const updateForm = (field) => (event) => {
    setPackageForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const revenueMonths = stats?.monthlyRevenue || [];
  const maxMonthlyRevenue = Math.max(...revenueMonths.map((month) => Number(month.revenue) || 0), 1);

  const tabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: TrendingUp },
      { id: 'packages', label: 'Journeys', icon: Package, count: packagesList.length },
      { id: 'bookings', label: 'Bookings', icon: CalendarCheck, count: adminBookings.length },
      { id: 'users', label: 'Users', icon: Users, count: usersList.length },
      { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, count: enquiriesList.length },
    ],
    [packagesList.length, adminBookings.length, usersList.length, enquiriesList.length]
  );

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-clay-500" />
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-400">
          Checking access
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-clip">
      <section className="border-b border-ink/10 bg-cream-200/40">
        <div className="container-x py-10 sm:py-12">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <span className="eyebrow">Operations studio</span>
              <h1 className="mt-4 font-display text-[2.8rem] leading-tight text-ink sm:text-[3.6rem]">
                The control room
              </h1>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink-500">
                Journeys, travellers and the small details that keep them moving. Changes here go
                live immediately.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await adminApi.seedDummyData();
                    await loadAllAdminData();
                  } catch (err) {
                    setError(err.response?.data?.message || 'Could not populate the sample data.');
                    setLoading(false);
                  }
                }}
                className="btn-outline btn-sm"
              >
                <Sparkles className="h-3.5 w-3.5" /> Load sample journeys
              </button>
              <button type="button" onClick={openCreateModal} className="btn-ink btn-sm">
                <Plus className="h-3.5 w-3.5" /> New journey
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x py-8">
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-auto text-[10px] font-extrabold uppercase tracking-wide underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-ink/10 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-extrabold transition ${
                  isActive
                    ? 'bg-ink text-cream-50 shadow-soft'
                    : 'text-ink-500 hover:bg-ink/[0.04] hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                {tab.label}
                {typeof tab.count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                      isActive ? 'bg-cream-100/15 text-cream-100' : 'bg-ink/[0.06] text-ink-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-3xl border border-ink/10 bg-cream-50 p-5">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton mt-4 h-8 w-32" />
                <div className="skeleton mt-3 h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: 'Confirmed revenue',
                      value: formatCurrency(stats?.totalRevenue || 0),
                      note: 'Paid bookings',
                      icon: CreditCard,
                    },
                    {
                      label: 'Total bookings',
                      value: stats?.totalBookings || adminBookings.length,
                      note: 'All time',
                      icon: CalendarCheck,
                    },
                    {
                      label: 'Live journeys',
                      value: packagesList.length,
                      note: 'In the collection',
                      icon: Package,
                    },
                    {
                      label: 'Registered users',
                      value: usersList.length,
                      note: 'Traveller accounts',
                      icon: Users,
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Reveal key={item.label} delay={index * 60}>
                        <div className="card-surface h-full p-5">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                              {item.label}
                            </p>
                            <Icon className="h-4 w-4 text-clay-500" strokeWidth={1.7} />
                          </div>
                          <p className="mt-3 font-display text-[2rem] leading-none text-ink">
                            {item.value}
                          </p>
                          <p className="mt-1.5 text-[10px] font-semibold text-ink-400">
                            {item.note}
                          </p>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <Reveal>
                    <div className="card-surface p-6">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="eyebrow">Revenue</p>
                          <h2 className="mt-2 font-display text-2xl leading-tight text-ink">
                            Six-month pulse
                          </h2>
                        </div>
                        <span className="text-[10px] font-bold text-ink-400">Confirmed payments</span>
                      </div>

                      {revenueMonths.length === 0 ? (
                        <div className="mt-8 rounded-2xl border border-dashed border-ink/15 px-4 py-10 text-center text-[12px] text-ink-400">
                          Revenue will appear here after the first successful payment.
                        </div>
                      ) : (
                        <div className="mt-8 flex h-44 items-end gap-2.5 sm:gap-4">
                          {revenueMonths.map((month) => {
                            const height = Math.max(
                              (Number(month.revenue) / maxMonthlyRevenue) * 100,
                              4
                            );
                            return (
                              <div key={month.month} className="flex flex-1 flex-col items-center">
                                <div className="relative flex h-32 w-full items-end">
                                  <div
                                    className="w-full rounded-t-xl bg-forest/90 transition-all duration-700 hover:bg-clay-500"
                                    style={{ height: `${height}%` }}
                                    title={`${month.month}: ${formatCurrency(month.revenue)}`}
                                  />
                                </div>
                                <span className="mt-2 text-[9px] font-extrabold uppercase tracking-wide text-ink-400">
                                  {month.month}
                                </span>
                                <span className="mt-0.5 text-[9px] font-semibold text-ink-300">
                                  {month.bookingsCount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Reveal>

                  <Reveal delay={80}>
                    <div className="card-surface p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="eyebrow">Latest</p>
                          <h2 className="mt-2 font-display text-2xl leading-tight text-ink">
                            Recent bookings
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('bookings')}
                          className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-clay-600 hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="mt-4 divide-y divide-ink/[0.07]">
                        {adminBookings.slice(0, 5).map((booking) => (
                          <div key={booking._id} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-extrabold text-ink">
                                {booking.user?.name || 'Traveller'}
                              </p>
                              <p className="truncate text-[10px] text-ink-400">
                                {booking.package?.title || 'Journey'}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[11px] font-extrabold text-ink">
                                {formatCurrency(booking.totalAmount)}
                              </p>
                              <p className="mt-0.5 text-[9px] font-semibold text-ink-400">
                                {formatDate(booking.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {adminBookings.length === 0 && (
                          <p className="py-8 text-center text-[12px] text-ink-400">
                            No bookings yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            )}

            {/* Packages */}
            {activeTab === 'packages' && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead className="border-b border-ink/10 bg-cream-100">
                      <tr>
                        <Th>Journey</Th>
                        <Th>Category</Th>
                        <Th>Price</Th>
                        <Th>Seats</Th>
                        <Th>Rating</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/[0.07]">
                      {packagesList.map((pkg) => (
                        <tr key={pkg._id || pkg.id} className="transition hover:bg-cream-100/60">
                          <Td>
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  pkg.images?.[0] ||
                                  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80'
                                }
                                alt=""
                                className="h-10 w-14 rounded-lg object-cover"
                              />
                              <div>
                                <p className="max-w-[240px] truncate font-extrabold text-ink">
                                  {pkg.title}
                                </p>
                                <p className="text-[10px] text-ink-400">{pkg.destination}</p>
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <span className="rounded-full bg-cream-200 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-ink-600">
                              {pkg.category}
                            </span>
                          </Td>
                          <Td className="font-extrabold text-ink">{formatCurrency(pkg.price)}</Td>
                          <Td>
                            <span className="font-bold text-ink">{pkg.availableSeats}</span>
                            <span className="text-ink-300"> / {pkg.totalSeats}</span>
                          </Td>
                          <Td>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-600">
                              <span className="text-amber-500">★</span>
                              {Number(pkg.avgRating || 0).toFixed(1)}
                              <span className="font-medium text-ink-300">
                                ({pkg.reviewCount || 0})
                              </span>
                            </span>
                          </Td>
                          <Td className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(pkg)}
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-500 transition hover:bg-ink/[0.06] hover:text-ink"
                                aria-label={`Edit ${pkg.title}`}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(pkg._id || pkg.id)}
                                className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"
                                aria-label={`Delete ${pkg.title}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings */}
            {activeTab === 'bookings' && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead className="border-b border-ink/10 bg-cream-100">
                      <tr>
                        <Th>Traveller</Th>
                        <Th>Journey</Th>
                        <Th>Party</Th>
                        <Th>Amount</Th>
                        <Th>Status</Th>
                        <Th>Booked</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/[0.07]">
                      {adminBookings.map((booking) => (
                        <tr key={booking._id} className="transition hover:bg-cream-100/60">
                          <Td>
                            <p className="font-extrabold text-ink">{booking.user?.name || 'User'}</p>
                            <p className="text-[10px] text-ink-400">{booking.user?.email}</p>
                          </Td>
                          <Td>
                            <p className="max-w-[240px] truncate font-semibold text-ink">
                              {booking.package?.title || 'Package'}
                            </p>
                          </Td>
                          <Td>{booking.travelers} guests</Td>
                          <Td className="font-extrabold text-ink">
                            {formatCurrency(booking.totalAmount)}
                          </Td>
                          <Td>
                            <StatusBadge status={booking.status} />
                          </Td>
                          <Td className="text-[11px] text-ink-400">
                            {formatDate(booking.createdAt)}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-cream-50 shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse">
                    <thead className="border-b border-ink/10 bg-cream-100">
                      <tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Access</Th>
                        <Th className="text-right">Action</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/[0.07]">
                      {usersList.map((user) => (
                        <tr key={user._id} className="transition hover:bg-cream-100/60">
                          <Td>
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-[10px] font-extrabold text-cream-50">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                              <span className="font-extrabold text-ink">{user.name}</span>
                            </div>
                          </Td>
                          <Td>{user.email}</Td>
                          <Td>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide ${
                                user.role === 'admin'
                                  ? 'bg-ink text-cream-50'
                                  : 'bg-cream-200 text-ink-600'
                              }`}
                            >
                              {user.role}
                            </span>
                          </Td>
                          <Td>
                            {user.isBlocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600">
                                <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-moss">
                                <ShieldCheck className="h-3.5 w-3.5" /> Active
                              </span>
                            )}
                          </Td>
                          <Td className="text-right">
                            {user.role !== 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(user._id)}
                                className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold transition ${
                                  user.isBlocked
                                    ? 'bg-moss/10 text-moss hover:bg-moss/15'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {user.isBlocked ? 'Restore access' : 'Suspend'}
                              </button>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enquiries */}
            {activeTab === 'enquiries' && (
              <div className="mt-6 space-y-3">
                {enquiriesList.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-ink/15 bg-cream-50 px-6 py-16 text-center">
                    <MessageSquare className="mx-auto h-9 w-9 text-ink-300" />
                    <h2 className="mt-4 font-display text-2xl text-ink">The inbox is clear.</h2>
                    <p className="mt-2 text-[12px] text-ink-400">
                      New enquiries from the website will appear here.
                    </p>
                  </div>
                ) : (
                  enquiriesList.map((enquiry) => (
                    <article
                      key={enquiry._id}
                      className="rounded-3xl border border-ink/10 bg-cream-50 p-5 shadow-soft"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-extrabold text-ink">{enquiry.name}</p>
                            <StatusBadge status={enquiry.status} />
                            <span className="text-[10px] font-semibold text-ink-400">
                              {formatDate(enquiry.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-ink-400">
                            {enquiry.email}
                            {enquiry.phone ? ` · ${enquiry.phone}` : ''}
                          </p>
                          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-[12.5px] leading-[1.8] text-ink-600">
                            {enquiry.message}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <label
                            htmlFor={`enquiry-status-${enquiry._id}`}
                            className="mb-1.5 block text-[9px] font-extrabold uppercase tracking-[0.12em] text-ink-400"
                          >
                            Update status
                          </label>
                          <select
                            id={`enquiry-status-${enquiry._id}`}
                            value={enquiry.status}
                            onChange={(event) =>
                              handleUpdateEnquiryStatus(enquiry._id, event.target.value)
                            }
                            className="rounded-xl border border-ink/10 bg-cream-50 px-3 py-2 text-[11px] font-bold text-ink focus:border-clay-400 focus:outline-none focus:ring-2 focus:ring-clay-500/10"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Package form */}
      <Modal
        isOpen={packageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        title={editingPackageId ? 'Edit journey' : 'Create a journey'}
        subtitle="Details publish immediately once saved."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSavePackage} className="space-y-5">
          {packageError && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {packageError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="package-title" className="field-label">
                Journey title
              </label>
              <input
                id="package-title"
                type="text"
                required
                value={packageForm.title}
                onChange={updateForm('title')}
                placeholder="Majestic Maldives Overwater Retreat"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="package-destination" className="field-label">
                Destination
              </label>
              <input
                id="package-destination"
                type="text"
                required
                value={packageForm.destination}
                onChange={updateForm('destination')}
                placeholder="Male, Maldives"
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="package-description" className="field-label">
              Description
            </label>
            <textarea
              id="package-description"
              required
              rows={3}
              value={packageForm.description}
              onChange={updateForm('description')}
              className="field-input resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="package-price" className="field-label">
                Price per person (₹)
              </label>
              <input
                id="package-price"
                type="number"
                required
                min="1"
                value={packageForm.price}
                onChange={updateForm('price')}
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="package-duration" className="field-label">
                Duration (days)
              </label>
              <input
                id="package-duration"
                type="number"
                required
                min="1"
                value={packageForm.durationDays}
                onChange={updateForm('durationDays')}
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="package-seats" className="field-label">
                Total seats
              </label>
              <input
                id="package-seats"
                type="number"
                required
                min="1"
                value={packageForm.totalSeats}
                onChange={updateForm('totalSeats')}
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="package-category" className="field-label">
                Category
              </label>
              <select
                id="package-category"
                value={packageForm.category}
                onChange={updateForm('category')}
                className="field-input"
              >
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="adventure">Adventure</option>
                <option value="city">City</option>
                <option value="religious">Religious</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="package-start" className="field-label">
                Departure date
              </label>
              <input
                id="package-start"
                type="date"
                required
                value={packageForm.startDate}
                onChange={updateForm('startDate')}
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="package-pickup" className="field-label">
                Pickup point
              </label>
              <input
                id="package-pickup"
                type="text"
                value={packageForm.pickupLocation}
                onChange={updateForm('pickupLocation')}
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="package-images" className="field-label">
              Image URLs <span className="normal-case tracking-normal text-ink-300">(comma separated)</span>
            </label>
            <input
              id="package-images"
              type="text"
              value={packageForm.images}
              onChange={updateForm('images')}
              className="field-input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="package-inclusions" className="field-label">
                Inclusions <span className="normal-case tracking-normal text-ink-300">(comma separated)</span>
              </label>
              <textarea
                id="package-inclusions"
                rows={2}
                value={packageForm.inclusions}
                onChange={updateForm('inclusions')}
                className="field-input resize-none text-[12px]"
              />
            </div>
            <div>
              <label htmlFor="package-exclusions" className="field-label">
                Exclusions <span className="normal-case tracking-normal text-ink-300">(comma separated)</span>
              </label>
              <textarea
                id="package-exclusions"
                rows={2}
                value={packageForm.exclusions}
                onChange={updateForm('exclusions')}
                className="field-input resize-none text-[12px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="package-itinerary" className="field-label">
              Day-by-day itinerary{' '}
              <span className="normal-case tracking-normal text-ink-300">
                (one line per day: Day 1: title — details)
              </span>
            </label>
            <textarea
              id="package-itinerary"
              rows={5}
              value={packageForm.itineraryText}
              onChange={updateForm('itineraryText')}
              className="field-input resize-y font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-ink/10 pt-5">
            <button
              type="button"
              onClick={() => setPackageModalOpen(false)}
              className="btn-outline btn-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={packageSaving} className="btn-ink btn-sm">
              {packageSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…
                </>
              ) : (
                'Save & publish'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

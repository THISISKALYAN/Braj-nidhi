"use client";

import React, { useState, useEffect, useCallback } from 'react';

type RoomType = 'deluxe2' | 'deluxe3' | 'deluxe4';

interface BookingRecord {
  id: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
  erpReservationId?: string;
  erpSyncStatus?: 'synced' | 'pending' | 'failed';
}

interface AdminData {
  bookings: BookingRecord[];
  snapshot: Record<RoomType, Record<string, number>>;
  totalRooms: Record<RoomType, number>;
  erpConfig: {
    hasCredentials: boolean;
    property: string;
    roomTypes: Record<RoomType, string>;
  };
}

const ROOM_NAMES: Record<RoomType, string> = {
  deluxe2: 'Deluxe 2 – Twin',
  deluxe3: 'Deluxe 3 – Triple',
  deluxe4: 'Deluxe 4 – Family',
};

const ROOM_COLORS: Record<RoomType, string> = {
  deluxe2: '#1a56db',
  deluxe3: '#7c3aed',
  deluxe4: '#C89B3C',
};

function nightCount(checkIn: string, checkOut: string) {
  return Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
  );
}

function fmtDate(s: string) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function fmtDateTime(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAvailabilityPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'erp'>('bookings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled'>('confirmed');
  const [filterRoom, setFilterRoom] = useState<'all' | RoomType>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Calendar view month
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/availability/admin');
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function doAction(id: string, action: string) {
    setActionLoading(id + action);
    try {
      await fetch(`/api/availability/admin?id=${id}&action=${action}`, { method: 'PATCH' });
      await load();
    } finally {
      setActionLoading(null);
    }
  }

  const bookings = data?.bookings ?? [];
  const filtered = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterRoom !== 'all' && b.roomType !== filterRoom) return false;
    return true;
  }).sort((a, b) => b.bookedAt.localeCompare(a.bookedAt));

  // Build calendar grid for selected month
  const calFirstDay = new Date(calYear, calMonth, 1);
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calDow = (calFirstDay.getDay() + 6) % 7; // Monday-first

  function getDateStr(d: number) {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function getAvailForDate(rt: RoomType, dateStr: string) {
    return data?.snapshot[rt]?.[dateStr] ?? data?.totalRooms[rt] ?? 0;
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      fontFamily: "var(--font-outfit), 'Inter', sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        background: '#1e293b',
        color: '#fff',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
            Braj Nidhi Guesthouse
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>ERP Availability Manager</div>
        </div>
        <button
          onClick={load}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* Stats row */}
        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {(['deluxe2','deluxe3','deluxe4'] as RoomType[]).map(rt => {
              const todayStr = today.toISOString().split('T')[0];
              const avail = data.snapshot[rt]?.[todayStr] ?? data.totalRooms[rt];
              const total = data.totalRooms[rt];
              const booked = total - avail;
              return (
                <div key={rt} style={{
                  background: '#fff', borderRadius: 14, padding: '18px 20px',
                  borderLeft: `4px solid ${ROOM_COLORS[rt]}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                    {ROOM_NAMES[rt]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: ROOM_COLORS[rt] }}>{avail}</span>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>/ {total} available today</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
                    {booked} booked tonight
                  </div>
                </div>
              );
            })}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '18px 20px',
              borderLeft: '4px solid #10b981',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                Total Bookings
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                  {bookings.filter(b => b.status === 'confirmed').length}
                </span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>confirmed</span>
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
                {bookings.filter(b => b.status === 'cancelled').length} cancelled
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 12, padding: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {([
            { key: 'bookings', label: '📋 Bookings' },
            { key: 'calendar', label: '📅 Availability Calendar' },
            { key: 'erp', label: '🔗 ERP Config' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#1e293b' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#6b7280',
                border: 'none', borderRadius: 8, padding: '8px 20px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 15 }}>Loading...</div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 18px', color: '#b91c1c', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Bookings Tab ── */}
        {!loading && data && activeTab === 'bookings' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', cursor: 'pointer' }}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterRoom}
                onChange={e => setFilterRoom(e.target.value as any)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', cursor: 'pointer' }}
              >
                <option value="all">All Rooms</option>
                <option value="deluxe2">Deluxe 2</option>
                <option value="deluxe3">Deluxe 3</option>
                <option value="deluxe4">Deluxe 4</option>
              </select>
              <div style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280', padding: '8px 0' }}>
                {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 15 }}>
                No bookings found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(b => {
                  const nights = nightCount(b.checkIn, b.checkOut);
                  const isCancelled = b.status === 'cancelled';
                  return (
                    <div key={b.id} style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '18px 22px',
                      borderLeft: `4px solid ${isCancelled ? '#d1d5db' : ROOM_COLORS[b.roomType]}`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      opacity: isCancelled ? 0.7 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        {/* Left: booking info */}
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{
                              background: isCancelled ? '#f3f4f6' : ROOM_COLORS[b.roomType],
                              color: isCancelled ? '#9ca3af' : '#fff',
                              borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700,
                            }}>
                              {ROOM_NAMES[b.roomType]}
                            </span>
                            <span style={{
                              background: isCancelled ? '#fef2f2' : '#f0fdf4',
                              color: isCancelled ? '#ef4444' : '#16a34a',
                              borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                            }}>
                              {b.status.toUpperCase()}
                            </span>
                            {b.erpSyncStatus && (
                              <span style={{
                                background: b.erpSyncStatus === 'synced' ? '#f0fdf4' : b.erpSyncStatus === 'failed' ? '#fef2f2' : '#fffbeb',
                                color: b.erpSyncStatus === 'synced' ? '#16a34a' : b.erpSyncStatus === 'failed' ? '#ef4444' : '#d97706',
                                borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                              }}>
                                ERP: {b.erpSyncStatus}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>CHECK-IN</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtDate(b.checkIn)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>CHECK-OUT</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtDate(b.checkOut)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>NIGHTS</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{nights}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>ROOMS</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{b.rooms}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>GUESTS</div>
                              <div style={{ fontSize: 15, fontWeight: 700 }}>{b.adults}A + {b.children}C</div>
                            </div>
                          </div>

                          {b.guestName && (
                            <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                              👤 {b.guestName}
                              {b.guestEmail && <span> · {b.guestEmail}</span>}
                              {b.guestPhone && <span> · {b.guestPhone}</span>}
                            </div>
                          )}
                          {b.erpReservationId && (
                            <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
                              ERP Reservation: <code>{b.erpReservationId}</code>
                            </div>
                          )}
                          <div style={{ marginTop: 4, fontSize: 11, color: '#d1d5db' }}>
                            ID: {b.id} · Booked: {fmtDateTime(b.bookedAt)}
                          </div>
                        </div>

                        {/* Right: actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {!isCancelled && (
                            <button
                              onClick={() => doAction(b.id, 'cancel')}
                              disabled={actionLoading === b.id + 'cancel'}
                              style={{
                                background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {actionLoading === b.id + 'cancel' ? '...' : 'Cancel Booking'}
                            </button>
                          )}
                          {isCancelled && (
                            <button
                              onClick={() => doAction(b.id, 'restore')}
                              disabled={actionLoading === b.id + 'restore'}
                              style={{
                                background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac',
                                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {actionLoading === b.id + 'restore' ? '...' : 'Restore Booking'}
                            </button>
                          )}
                          {!isCancelled && b.erpSyncStatus !== 'synced' && (
                            <button
                              onClick={() => doAction(b.id, 'retry-erp')}
                              disabled={actionLoading === b.id + 'retry-erp'}
                              style={{
                                background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a',
                                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {actionLoading === b.id + 'retry-erp' ? '...' : 'Retry ERP Sync'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Calendar Tab ── */}
        {!loading && data && activeTab === 'calendar' && (
          <div>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <button
                onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16 }}
              >←</button>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{MONTHS[calMonth]} {calYear}</div>
              <button
                onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16 }}
              >→</button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, background: '#dcfce7', borderRadius: 3 }} /> Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, background: '#fef9c3', borderRadius: 3 }} /> 1-2 rooms left
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, background: '#fee2e2', borderRadius: 3 }} /> Fully booked
              </span>
            </div>

            {(['deluxe2','deluxe3','deluxe4'] as RoomType[]).map(rt => {
              const total = data.totalRooms[rt];
              return (
                <div key={rt} style={{
                  background: '#fff', borderRadius: 14, padding: '20px 22px',
                  marginBottom: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderTop: `3px solid ${ROOM_COLORS[rt]}`,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: ROOM_COLORS[rt], marginBottom: 16 }}>
                    {ROOM_NAMES[rt]} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 13 }}>({total} rooms total)</span>
                  </div>

                  {/* Weekday headers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', padding: '4px 0' }}>{d}</div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                    {/* Empty cells before first day */}
                    {Array.from({ length: calDow }).map((_, i) => (
                      <div key={`e${i}`} />
                    ))}
                    {Array.from({ length: calDaysInMonth }).map((_, i) => {
                      const d = i + 1;
                      const dateStr = getDateStr(d);
                      const avail = getAvailForDate(rt, dateStr);
                      const isToday = dateStr === today.toISOString().split('T')[0];

                      let bg = '#f0fdf4'; // available
                      let textColor = '#166534';
                      if (avail === 0) { bg = '#fee2e2'; textColor = '#991b1b'; }
                      else if (avail <= 1) { bg = '#fef9c3'; textColor = '#854d0e'; }

                      return (
                        <div
                          key={d}
                          style={{
                            background: bg,
                            borderRadius: 8,
                            padding: '8px 4px 6px',
                            textAlign: 'center',
                            border: isToday ? `2px solid ${ROOM_COLORS[rt]}` : '2px solid transparent',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: textColor }}>{d}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: textColor, marginTop: 2 }}>
                            {avail}/{total}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ERP Config Tab ── */}
        {!loading && data && activeTab === 'erp' && (
          <div style={{ maxWidth: 640 }}>
            {/* Connection Status */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 18,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${data.erpConfig.hasCredentials ? '#10b981' : '#ef4444'}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
                {data.erpConfig.hasCredentials ? '✅ ERP Credentials Configured' : '❌ ERP Credentials Missing'}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                <div><strong>Base URL:</strong> https://pankaj.vcmerp.in</div>
                <div><strong>Property:</strong> {data.erpConfig.property || '(not set)'}</div>
              </div>
            </div>

            {/* Room Type Mapping */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 18,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>ERP Room Type Mapping</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                Set these in <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> to
                enable ERP reservation sync when a guest books.
              </div>

              {(['deluxe2','deluxe3','deluxe4'] as RoomType[]).map(rt => {
                const configured = data.erpConfig.roomTypes[rt];
                return (
                  <div key={rt} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid #f0f0f0',
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ROOM_COLORS[rt] }}>
                        {ROOM_NAMES[rt]}
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        env: <code>ERP_ROOM_TYPE_{rt.toUpperCase()}</code>
                      </div>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      background: configured ? '#f0fdf4' : '#fef2f2',
                      color: configured ? '#16a34a' : '#ef4444',
                      padding: '4px 12px', borderRadius: 20,
                    }}>
                      {configured || 'Not set'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How to configure */}
            <div style={{
              background: '#f8faff', borderRadius: 14, padding: '20px 24px',
              border: '1px solid #dbeafe', fontSize: 13, lineHeight: 1.8,
            }}>
              <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>How to get ERP Room Type IDs</div>
              <ol style={{ margin: 0, paddingLeft: 18, color: '#374151' }}>
                <li>Log into ERP at <a href="https://pankaj.vcmerp.in" target="_blank" rel="noreferrer" style={{ color: '#1a56db' }}>pankaj.vcmerp.in</a></li>
                <li>Go to <strong>Guesthouse → Room Type</strong> list</li>
                <li>Copy the <strong>Name</strong> column (document ID) for each room type</li>
                <li>Add to <code>.env.local</code>:<br />
                  <code style={{ display: 'block', background: '#1e293b', color: '#e2e8f0', padding: '10px 14px', borderRadius: 8, marginTop: 6, fontSize: 12 }}>
                    ERP_ROOM_TYPE_DELUXE2=Deluxe-Twin-0001<br />
                    ERP_ROOM_TYPE_DELUXE3=Deluxe-Triple-0001<br />
                    ERP_ROOM_TYPE_DELUXE4=Deluxe-Family-0001
                  </code>
                </li>
                <li>Restart the Next.js dev server to apply</li>
              </ol>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderRadius: 8, color: '#92400e', fontSize: 12 }}>
                ⚡ Even without ERP room type IDs configured, bookings are recorded locally and the calendar availability system works fully. ERP sync is optional.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

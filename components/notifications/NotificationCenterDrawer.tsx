'use client';

/**
 * 🏛️ Veloura Living — In-App Notification Center Drawer
 * Quiet luxury slide-out panel with categorized alert timelines and 1-click actions.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/providers/NotificationProvider';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Package,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Clock,
} from 'lucide-react';

export function NotificationCenterDrawer() {
  const {
    notifications,
    unreadCount,
    isOpen,
    closeDrawer,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ORDER_STATUS' | 'VIP_CONCIERGE' | 'REFUND_PROCESSED'>('ALL');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    return n.type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS':
      case 'LOGISTICS_OUT_FOR_DELIVERY':
        return <Package className="w-4 h-4 text-[#A9794F]" />;
      case 'VIP_CONCIERGE':
        return <Sparkles className="w-4 h-4 text-[#D8B486]" />;
      case 'REFUND_PROCESSED':
        return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      case 'SECURITY_ALERT':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#A9794F]" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div
        className="relative w-full max-w-md bg-[#211915] text-[#FAF7F2] border-l border-[#8B5A2B]/30 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#8B5A2B]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4A2C1A]/60 border border-[#8B5A2B]/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#D8B486]" />
            </div>
            <div>
              <h2 className="font-serif text-lg tracking-wide text-[#FAF7F2]">
                Atelier Communications
              </h2>
              <p className="text-xs text-[#B9AA99]">
                {unreadCount > 0 ? `${unreadCount} unread notices` : 'All caught up'}
              </p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 text-[#B9AA99] hover:text-[#FAF7F2] rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close notification center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters & Actions */}
        <div className="px-6 py-3 border-b border-[#8B5A2B]/20 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ORDER_STATUS', label: 'Orders' },
              { id: 'VIP_CONCIERGE', label: 'VIP Drops' },
              { id: 'REFUND_PROCESSED', label: 'Refunds' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#4A2C1A] text-[#FAF7F2] border border-[#8B5A2B]/50'
                    : 'text-[#B9AA99] hover:text-[#FAF7F2] hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[#D8B486] hover:text-[#FAF7F2] flex items-center gap-1 font-medium transition-colors shrink-0"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}
        </div>

        {/* Notification Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-[#B9AA99]/50" />
              </div>
              <p className="font-serif text-base text-[#FAF7F2] mb-1">No Notifications</p>
              <p className="text-xs text-[#B9AA99] max-w-xs">
                Your artisan orders, tracking milestones, and VIP atelier updates will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`p-4 rounded-lg border transition-all relative ${
                  notif.is_read
                    ? 'bg-white/[0.02] border-white/5 opacity-80 hover:opacity-100 hover:bg-white/[0.04]'
                    : 'bg-[#4A2C1A]/30 border-[#8B5A2B]/40 shadow-sm'
                }`}
              >
                {/* Unread Glow Dot */}
                {!notif.is_read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#A9794F] ring-4 ring-[#A9794F]/20" />
                )}

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-md bg-[#2A1A12] border border-[#8B5A2B]/30 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/5 text-[#D8B486]">
                        {notif.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-[#B9AA99] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notif.created_at)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#FAF7F2] mb-1 leading-snug">
                      {notif.title}
                    </h3>
                    <p className="text-xs text-[#B9AA99] leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        onClick={closeDrawer}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D8B486] hover:text-[#FAF7F2] transition-colors"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-[#8B5A2B]/20 bg-[#1c1410] flex items-center justify-between text-xs text-[#B9AA99]">
            <span>{notifications.length} total entries</span>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

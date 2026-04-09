"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageTemplate from "@/components/PageTemplate";
import BadgeGrid from "@/components/BadgeGrid";
import BadgeIcon from "@/components/BadgeIcon";

const API_URL = "http://localhost:8000";

interface AchievementData {
  badges: any[];
  metrics: {
    sparks_shared: number;
    sparks_voted: number;
    login_count: number;
  };
}

export default function ProfilePage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAchievements();
    }
  }, [token]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error("Failed to fetch achievements", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTemplate
      title="Your Profile"
      description="Citizen Statistics"
      subtitle={`${user?.display_name || user?.email}'s progress in the Spark ecosystem.`}
    >
      <div className="space-y-12">
        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-line flex items-center gap-6">
            <div className="w-12 h-12 bg-teal/5 rounded-lg flex items-center justify-center text-teal">
              <BadgeIcon name="Zap" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rosy uppercase tracking-widest mb-1">Sparks Shared</p>
              <p className="text-3xl font-serif text-stone-800">{data?.metrics.sparks_shared || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-line flex items-center gap-6">
            <div className="w-12 h-12 bg-teal/5 rounded-lg flex items-center justify-center text-teal">
              <BadgeIcon name="ThumbsUp" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rosy uppercase tracking-widest mb-1">Sparks Voted</p>
              <p className="text-3xl font-serif text-stone-800">{data?.metrics.sparks_voted || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-line flex items-center gap-6">
            <div className="w-12 h-12 bg-teal/5 rounded-lg flex items-center justify-center text-teal">
              <BadgeIcon name="Calendar" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rosy uppercase tracking-widest mb-1">Total Visits</p>
              <p className="text-3xl font-serif text-stone-800">{data?.metrics.login_count || 0}</p>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-line/30">
            <h2 className="text-2xl font-serif text-teal">Badges & Achievements</h2>
            <span className="text-xs font-bold text-rosy uppercase tracking-widest">
              {data?.badges.filter(b => b.achieved).length || 0} / {data?.badges.length || 0} Unlocked
            </span>
          </div>
          
          <BadgeGrid badges={data?.badges || []} />
        </section>
      </div>
    </PageTemplate>
  );
}

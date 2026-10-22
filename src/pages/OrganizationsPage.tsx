import React, { useState, useEffect } from 'react';
import { OrganizationInfo } from '../types';
import { api } from '../services/api';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        const data = await api.getOrganizations();
        setOrganizations(data);
      } catch (err) {
        console.error('Failed to load organizations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#344E41]">Verified Recipient Organizations</h1>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E5EFE5] text-[#344E41] border border-[#8BAF92]/30">
            Shelters & NGOs
          </span>
        </div>
        <p className="text-xs text-[#373A36]/70 mt-0.5">
          Orphanages, soup kitchens, community shelters, and emergency food banks eligible to collect surplus food.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-stone-500">Loading organization directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {organizations.map((org, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-[#344E41]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E5EFE5] text-[#344E41] flex items-center justify-center font-bold text-sm shrink-0">
                    <Building2 className="w-5 h-5 text-[#8BAF92]" />
                  </div>
                  {org.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#344E41] leading-tight">{org.name}</h3>
                  <span className="text-xs font-semibold text-[#8BAF92] uppercase tracking-wide">
                    {org.type}
                  </span>
                </div>

                {org.description && (
                  <p className="text-xs text-[#373A36]/80 leading-relaxed line-clamp-3">
                    {org.description}
                  </p>
                )}

                <div className="text-xs text-[#373A36] space-y-1.5 pt-2 border-t border-[#344E41]/10">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Users className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>Beneficiaries served: <strong>{org.beneficiaries || 50}+ daily</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>{org.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-[#8BAF92]" />
                    <span>{org.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#344E41]/10 mt-4 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Liaison: {org.contactPerson}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

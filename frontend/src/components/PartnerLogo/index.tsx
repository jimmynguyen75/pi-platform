import { useState } from 'react';
import { cn } from '../../lib/utils';

// Map common partner names → their actual domain for Clearbit lookup
const DOMAIN_MAP: Record<string, string> = {
  'microsoft': 'microsoft.com',
  'cisco': 'cisco.com',
  'dell': 'dell.com',
  'dell technologies': 'dell.com',
  'hp': 'hp.com',
  'hpe': 'hpe.com',
  'hewlett packard enterprise': 'hpe.com',
  'aws': 'aws.amazon.com',
  'amazon': 'amazon.com',
  'amazon web services': 'aws.amazon.com',
  'google': 'google.com',
  'google cloud': 'cloud.google.com',
  'oracle': 'oracle.com',
  'sap': 'sap.com',
  'salesforce': 'salesforce.com',
  'servicenow': 'servicenow.com',
  'atlassian': 'atlassian.com',
  'crowdstrike': 'crowdstrike.com',
  'palo alto networks': 'paloaltonetworks.com',
  'paloalto': 'paloaltonetworks.com',
  'deloitte': 'deloitte.com',
  'accenture': 'accenture.com',
  'cognizant': 'cognizant.com',
  'vmware': 'vmware.com',
  'netapp': 'netapp.com',
  'fortinet': 'fortinet.com',
  'juniper': 'juniper.net',
  'juniper networks': 'juniper.net',
  'ibm': 'ibm.com',
  'adobe': 'adobe.com',
  'zoom': 'zoom.us',
  'slack': 'slack.com',
  'splunk': 'splunk.com',
  'nutanix': 'nutanix.com',
  'pure storage': 'purestorage.com',
  'veeam': 'veeam.com',
};

function guessLogoUrl(name: string): string | null {
  const key = name.toLowerCase().trim();
  const domain = DOMAIN_MAP[key];
  if (domain) return `https://logo.clearbit.com/${domain}`;

  // Try the first word as a .com domain
  const firstWord = key.split(/\s+/)[0];
  return `https://logo.clearbit.com/${firstWord}.com`;
}

interface PartnerLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
};

const GRADIENT_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-indigo-600',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

export function PartnerLogo({ name, logoUrl, size = 'md', className }: PartnerLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(
    logoUrl || guessLogoUrl(name)
  );
  const [failed, setFailed] = useState(false);

  const sizeClass = SIZE[size];
  const gradient = getGradient(name);
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (failed || !imgSrc) {
    return (
      <div className={cn(
        'rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br shrink-0',
        sizeClass, gradient, className
      )}>
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0', sizeClass, className)}>
      <img
        src={imgSrc}
        alt={name}
        className="w-full h-full object-contain p-1"
        onError={() => {
          // If guessed domain failed, try .com variant
          if (imgSrc !== logoUrl && logoUrl) {
            setImgSrc(logoUrl);
          } else {
            setFailed(true);
          }
        }}
      />
    </div>
  );
}

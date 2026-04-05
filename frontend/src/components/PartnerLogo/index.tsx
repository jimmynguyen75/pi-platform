import { useState } from 'react';
import { cn } from '../../lib/utils';

// Curated direct logo URLs — reliable CDN sources
const LOGO_MAP: Record<string, string> = {
  'microsoft':                'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
  'cisco':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/200px-Cisco_logo_blue_2016.svg.png',
  'dell':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/200px-Dell_Logo.svg.png',
  'dell technologies':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/200px-Dell_Logo.svg.png',
  'hp':                       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/180px-HP_logo_2012.svg.png',
  'hpe':                      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hewlett_Packard_Enterprise_logo.svg/200px-Hewlett_Packard_Enterprise_logo.svg.png',
  'hewlett packard enterprise':'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Hewlett_Packard_Enterprise_logo.svg/200px-Hewlett_Packard_Enterprise_logo.svg.png',
  'aws':                      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/200px-Amazon_Web_Services_Logo.svg.png',
  'amazon web services':      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/200px-Amazon_Web_Services_Logo.svg.png',
  'google':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png',
  'google cloud':             'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Google_Cloud_logo.svg/200px-Google_Cloud_logo.svg.png',
  'oracle':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Oracle_logo.svg/200px-Oracle_logo.svg.png',
  'sap':                      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/200px-SAP_2011_logo.svg.png',
  'salesforce':               'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/200px-Salesforce.com_logo.svg.png',
  'servicenow':               'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/ServiceNow_logo.svg/200px-ServiceNow_logo.svg.png',
  'atlassian':                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Atlassian-logo.svg/200px-Atlassian-logo.svg.png',
  'crowdstrike':              'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/CrowdStrike_logo.svg/200px-CrowdStrike_logo.svg.png',
  'palo alto networks':       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Palo_Alto_Networks_logo.svg/200px-Palo_Alto_Networks_logo.svg.png',
  'paloalto':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Palo_Alto_Networks_logo.svg/200px-Palo_Alto_Networks_logo.svg.png',
  'deloitte':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/200px-Deloitte.svg.png',
  'accenture':                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Accenture.svg/200px-Accenture.svg.png',
  'cognizant':                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Cognizant_logo.svg/200px-Cognizant_logo.svg.png',
  'vmware':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Vmware.svg/200px-Vmware.svg.png',
  'netapp':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/NetApp_logo.svg/200px-NetApp_logo.svg.png',
  'fortinet':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Fortinet_logo.svg/200px-Fortinet_logo.svg.png',
  'ibm':                      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png',
  'adobe':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Headquarters.jpg/200px-Adobe_Corporate_Headquarters.jpg',
  'zoom':                     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zoom_Communications_Logo.svg/200px-Zoom_Communications_Logo.svg.png',
  'splunk':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Splunk_logo.svg/200px-Splunk_logo.svg.png',
  'nutanix':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Nutanix_Logo.svg/200px-Nutanix_Logo.svg.png',
  'veeam':                    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Veeam_logo.svg/200px-Veeam_logo.svg.png',
  'juniper networks':         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Juniper_Networks_logo.svg/200px-Juniper_Networks_logo.svg.png',
  'juniper':                  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Juniper_Networks_logo.svg/200px-Juniper_Networks_logo.svg.png',
};

// Fallback: Google S2 favicon service (reliable, maintained by Google)
function googleFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

// Guess domain from name for favicon fallback
const DOMAIN_GUESS: Record<string, string> = {
  'microsoft': 'microsoft.com', 'cisco': 'cisco.com', 'dell': 'dell.com',
  'dell technologies': 'dell.com', 'hp': 'hp.com', 'hpe': 'hpe.com',
  'aws': 'aws.amazon.com', 'amazon web services': 'aws.amazon.com',
  'google cloud': 'cloud.google.com', 'oracle': 'oracle.com', 'sap': 'sap.com',
  'salesforce': 'salesforce.com', 'servicenow': 'servicenow.com',
  'atlassian': 'atlassian.com', 'crowdstrike': 'crowdstrike.com',
  'palo alto networks': 'paloaltonetworks.com', 'paloalto': 'paloaltonetworks.com',
  'deloitte': 'deloitte.com', 'accenture': 'accenture.com',
  'cognizant': 'cognizant.com', 'vmware': 'vmware.com', 'netapp': 'netapp.com',
  'fortinet': 'fortinet.com', 'ibm': 'ibm.com', 'adobe': 'adobe.com',
  'zoom': 'zoom.us', 'splunk': 'splunk.com', 'nutanix': 'nutanix.com',
  'veeam': 'veeam.com', 'juniper networks': 'juniper.net', 'juniper': 'juniper.net',
};

function getLogoSrc(name: string, logoUrl?: string | null): string[] {
  // Priority: explicit logoUrl → curated Wikipedia SVG → Google favicon → nothing
  const key = name.toLowerCase().trim();
  const sources: string[] = [];
  if (logoUrl) sources.push(logoUrl);
  if (LOGO_MAP[key]) sources.push(LOGO_MAP[key]);
  const domain = DOMAIN_GUESS[key] ?? `${key.split(/\s+/)[0]}.com`;
  sources.push(googleFaviconUrl(domain));
  return sources;
}

const GRADIENT_COLORS = [
  'from-indigo-500 to-purple-600', 'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',    'from-violet-500 to-indigo-600',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
}

const SIZE = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
const TEXT = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

interface PartnerLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PartnerLogo({ name, logoUrl, size = 'md', className }: PartnerLogoProps) {
  const sources = getLogoSrc(name, logoUrl);
  const [idx, setIdx] = useState(0);
  const gradient = getGradient(name);
  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (idx >= sources.length) {
    // All sources failed → gradient initials
    return (
      <div className={cn(
        'rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br shrink-0',
        SIZE[size], TEXT[size], gradient, className
      )}>
        {initials}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0',
      SIZE[size], className
    )}>
      <img
        src={sources[idx]}
        alt={name}
        className="w-full h-full object-contain p-1"
        onError={() => setIdx(i => i + 1)}
      />
    </div>
  );
}

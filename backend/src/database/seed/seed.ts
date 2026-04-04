import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dayjsLib from 'dayjs';
const dayjs = (dayjsLib as any).default ?? dayjsLib;
import { Employee } from '../../modules/employees/employee.entity';
import { Domain } from '../../modules/domains/domain.entity';
import { Partner } from '../../modules/partners/partner.entity';
import { Activity } from '../../modules/activities/activity.entity';
import { History } from '../../modules/history/history.entity';
import { Deal } from '../../modules/deals/deal.entity';
import { Fund } from '../../modules/funds/fund.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'pi_platform',
  username: process.env.DATABASE_USER || 'pi_user',
  password: process.env.DATABASE_PASSWORD || 'pi_password',
  entities: [Employee, Domain, Partner, Activity, History, Deal, Fund],
  synchronize: true,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Database connected. Starting seed...');

  // Clear existing data
  await dataSource.query('TRUNCATE TABLE history CASCADE');
  await dataSource.query('TRUNCATE TABLE activities CASCADE');
  await dataSource.query('TRUNCATE TABLE deals CASCADE');
  await dataSource.query('TRUNCATE TABLE funds CASCADE');
  await dataSource.query('TRUNCATE TABLE partners CASCADE');
  await dataSource.query('TRUNCATE TABLE domains CASCADE');
  await dataSource.query('TRUNCATE TABLE employees CASCADE');

  const employeeRepo = dataSource.getRepository(Employee);
  const domainRepo = dataSource.getRepository(Domain);
  const partnerRepo = dataSource.getRepository(Partner);
  const activityRepo = dataSource.getRepository(Activity);
  const dealRepo = dataSource.getRepository(Deal);
  const fundRepo = dataSource.getRepository(Fund);

  // ─── Domains ─────────────────────────────────────────────────────────────
  const domains = await domainRepo.save([
    { name: 'Software', description: 'SaaS and software platform partnerships', colorHex: '#1890ff' },
    { name: 'Hardware', description: 'Device and infrastructure partners', colorHex: '#52c41a' },
    { name: 'Cloud Services', description: 'Cloud platform and IaaS/PaaS', colorHex: '#fa8c16' },
    { name: 'Security', description: 'Cybersecurity and compliance partners', colorHex: '#f5222d' },
    { name: 'Professional Services', description: 'Consulting and SI partners', colorHex: '#722ed1' },
  ]);

  const [sw, hw, cloud, sec, ps] = domains;
  console.log('✓ Domains seeded');

  // ─── Managers ─────────────────────────────────────────────────────────────
  const hashedPw = await bcrypt.hash('password123', 10);

  const adminUser = await employeeRepo.save({
    name: 'Sarah Chen',
    email: 'admin@company.com',
    password: hashedPw,
    role: 'admin' as const,
    title: 'Head of Partnerships',
  });

  const managers = await employeeRepo.save([
    {
      name: 'David Kim',
      email: 'david.kim@company.com',
      password: hashedPw,
      role: 'manager' as const,
      title: 'Software Domain Lead',
    },
    {
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@company.com',
      password: hashedPw,
      role: 'manager' as const,
      title: 'Infrastructure Domain Lead',
    },
    {
      name: 'Michael Zhang',
      email: 'michael.zhang@company.com',
      password: hashedPw,
      role: 'manager' as const,
      title: 'Cloud & Security Domain Lead',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@company.com',
      password: hashedPw,
      role: 'manager' as const,
      title: 'Professional Services Lead',
    },
  ]);

  const [mgrDavid, mgrEmma, mgrMichael, mgrPriya] = managers;
  console.log('✓ Managers seeded');

  // ─── Partners ────────────────────────────────────────────────────────────
  const partners = await partnerRepo.save([
    // Software — David Kim
    {
      name: 'Microsoft',
      domainId: sw.id,
      managerId: mgrDavid.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Microsoft 365 and Azure integration partnership covering enterprise licensing, cloud consumption, and co-sell programs.',
      logoUrl: null,
      officialLinks: [
        { label: 'Vendor Portal', url: 'https://partner.microsoft.com' },
        { label: 'Documentation', url: 'https://docs.microsoft.com' },
        { label: 'Support', url: 'https://support.microsoft.com' },
      ],
      contactInfo: { email: 'enterprise@microsoft.com', phone: '+1-800-642-7676', contactName: 'Alex Turner (Partner TAM)' },
      notes: 'Key contacts: Alex Turner (TAM) and Jane Smith (Account Executive). Annual QBR in Q1. Renewal window: October each year. Requires executive sponsor sign-off for deals > $500k.',
    },
    {
      name: 'Salesforce',
      domainId: sw.id,
      managerId: mgrDavid.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'CRM platform partnership with co-implementation and AppExchange ISV program.',
      officialLinks: [
        { label: 'Partner Community', url: 'https://partners.salesforce.com' },
        { label: 'Trailhead', url: 'https://trailhead.salesforce.com' },
      ],
      contactInfo: { email: 'alliances@salesforce.com', contactName: 'Maria Gonzalez (Alliance Manager)' },
      notes: 'Participate in Dreamforce annually. ISV certification renewal due in June.',
    },
    {
      name: 'ServiceNow',
      domainId: sw.id,
      managerId: mgrDavid.id,
      priorityLevel: 'Key' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'ITSM and workflow automation platform. Core ITSM partner for service delivery.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partnerportal.servicenow.com' },
      ],
      contactInfo: { email: 'partners@servicenow.com', contactName: 'Tom Bradley' },
      notes: 'Focus on SecOps and HR modules for H2 expansion.',
    },
    {
      name: 'SAP',
      domainId: sw.id,
      managerId: mgrDavid.id,
      priorityLevel: 'Key' as const,
      status: 'Risk' as const,
      healthScore: 0,
      description: 'ERP and enterprise software. S/4HANA migration project currently stalled.',
      officialLinks: [
        { label: 'SAP PartnerEdge', url: 'https://partneredge.sap.com' },
      ],
      contactInfo: { email: 'enterprise@sap.com', phone: '+49-6227-7-47474' },
      notes: 'Migration timeline has slipped twice. Escalate to executive sponsor if no progress by Q2.',
    },
    {
      name: 'Atlassian',
      domainId: sw.id,
      managerId: mgrDavid.id,
      priorityLevel: 'Normal' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Dev tools and project management — Jira, Confluence, Bitbucket.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partner.atlassian.com' },
        { label: 'Marketplace', url: 'https://marketplace.atlassian.com' },
      ],
      contactInfo: { email: 'partners@atlassian.com' },
      notes: 'Cloud migration project ongoing. Jira Software used by 800+ users internally.',
    },
    // Hardware — Emma Rodriguez
    {
      name: 'Cisco',
      domainId: hw.id,
      managerId: mgrEmma.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Networking infrastructure partner — SD-WAN, Webex, and datacenter networking.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partners.cisco.com' },
        { label: 'Certifications', url: 'https://learningnetwork.cisco.com' },
      ],
      contactInfo: { email: 'partners@cisco.com', contactName: 'Ryan Park (Channel Manager)', phone: '+1-408-526-4000' },
      notes: 'Gold Partner status. Annual recertification in September. SD-WAN deployment across 12 sites completed Q1.',
    },
    {
      name: 'Dell Technologies',
      domainId: hw.id,
      managerId: mgrEmma.id,
      priorityLevel: 'Key' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Server and client hardware — PowerEdge servers and PowerStore storage.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partnerdirect.dell.com' },
      ],
      contactInfo: { email: 'enterprise@dell.com', contactName: 'Lisa Chen' },
      notes: 'Preferred hardware vendor for datacenter refresh. ProSupport contract expires December.',
    },
    {
      name: 'HPE',
      domainId: hw.id,
      managerId: mgrEmma.id,
      priorityLevel: 'Key' as const,
      status: 'Risk' as const,
      healthScore: 0,
      description: 'Enterprise infrastructure — GreenLake consumption model under evaluation.',
      officialLinks: [
        { label: 'Partner Ready', url: 'https://h17007.www1.hpe.com/us/en/partner' },
      ],
      contactInfo: { email: 'partners@hpe.com' },
      notes: 'GreenLake evaluation paused due to budget freeze. Follow up in Q3.',
    },
    // Cloud — Michael Zhang
    {
      name: 'AWS',
      domainId: cloud.id,
      managerId: mgrMichael.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Primary cloud infrastructure partner — Enterprise Discount Program (EDP) and AWS Alliance.',
      officialLinks: [
        { label: 'AWS Partner Network', url: 'https://aws.amazon.com/partners' },
        { label: 'AWS Console', url: 'https://console.aws.amazon.com' },
        { label: 'Documentation', url: 'https://docs.aws.amazon.com' },
      ],
      contactInfo: { email: 'aws-enterprise@amazon.com', contactName: 'James Wu (Partner Manager)', phone: '+1-206-266-1000' },
      notes: 'EDP signed for 3 years — committed $2M ARR. re:Invent attendance confirmed. Migration targets: 30% of workloads by EOY.',
    },
    {
      name: 'Google Cloud',
      domainId: cloud.id,
      managerId: mgrMichael.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'AI and data analytics cloud partner — BigQuery and Vertex AI initiatives.',
      officialLinks: [
        { label: 'Google Cloud Partners', url: 'https://cloud.google.com/partners' },
        { label: 'Console', url: 'https://console.cloud.google.com' },
      ],
      contactInfo: { email: 'gcp-partners@google.com', contactName: 'Sophie Laurent' },
      notes: 'Exploring Premier Partner tier upgrade. BigQuery data warehouse pilot completed successfully.',
    },
    {
      name: 'Oracle Cloud',
      domainId: cloud.id,
      managerId: mgrMichael.id,
      priorityLevel: 'Key' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Cloud database and ERP cloud services.',
      officialLinks: [
        { label: 'Oracle Partner Network', url: 'https://partner.oracle.com' },
      ],
      contactInfo: { email: 'cloud@oracle.com' },
      notes: 'OCI credits included in enterprise agreement.',
    },
    // Security — Michael Zhang
    {
      name: 'CrowdStrike',
      domainId: sec.id,
      managerId: mgrMichael.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Endpoint security platform — Falcon XDR deployed to 5,000+ endpoints.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partners.crowdstrike.com' },
        { label: 'Falcon Console', url: 'https://falcon.crowdstrike.com' },
      ],
      contactInfo: { email: 'partners@crowdstrike.com', contactName: 'Diana Ross (Enterprise AE)' },
      notes: 'Renewing Falcon Enterprise license in Q3. Threat intelligence briefings quarterly.',
    },
    {
      name: 'Palo Alto Networks',
      domainId: sec.id,
      managerId: mgrMichael.id,
      priorityLevel: 'Key' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Next-gen firewall and SASE security platform.',
      officialLinks: [
        { label: 'Partner Portal', url: 'https://partners.paloaltonetworks.com' },
      ],
      contactInfo: { email: 'partners@paloaltonetworks.com' },
      notes: 'SASE evaluation in progress for branch offices.',
    },
    // Professional Services — Priya Patel
    {
      name: 'Deloitte',
      domainId: ps.id,
      managerId: mgrPriya.id,
      priorityLevel: 'Strategic' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Strategic consulting and SI partner — cloud migration advisory and digital transformation.',
      officialLinks: [
        { label: 'Deloitte Digital', url: 'https://www2.deloitte.com' },
        { label: 'Project Portal', url: 'https://projectportal.deloitte.com' },
      ],
      contactInfo: { email: 'alliances@deloitte.com', contactName: 'Christopher Lee (Partner Lead)', phone: '+1-212-318-7000' },
      notes: 'Active engagement: Cloud Migration Program (12-month advisory). Staffing confirmed through Q3. Monthly steering committee meetings.',
    },
    {
      name: 'Accenture',
      domainId: ps.id,
      managerId: mgrPriya.id,
      priorityLevel: 'Key' as const,
      status: 'Active' as const,
      healthScore: 0,
      description: 'Technology consulting and implementation services.',
      officialLinks: [
        { label: 'Accenture Partnership', url: 'https://www.accenture.com' },
      ],
      contactInfo: { email: 'enterprise@accenture.com', contactName: 'Jennifer Walsh' },
      notes: 'Data analytics implementation project starting Q2.',
    },
    {
      name: 'Cognizant',
      domainId: ps.id,
      managerId: mgrPriya.id,
      priorityLevel: 'Normal' as const,
      status: 'Risk' as const,
      healthScore: 0,
      description: 'IT services and consulting. SLA performance below target in Q1.',
      officialLinks: [
        { label: 'Cognizant Partner', url: 'https://www.cognizant.com' },
      ],
      contactInfo: { email: 'enterprise@cognizant.com' },
      notes: 'Issued formal performance improvement notice in January. Review quarterly SLA metrics closely.',
    },
  ]);

  const [
    microsoft, salesforce, servicenow, sap, atlassian,
    cisco, dell, hpe,
    aws, gcloud, oracle,
    crowdstrike, paloalto,
    deloitte, accenture, cognizant,
  ] = partners;

  console.log('✓ Partners seeded');

  // ─── Activities ──────────────────────────────────────────────────────────
  const daysAgo = (n: number) => dayjs().subtract(n, 'day').format('YYYY-MM-DD');

  const activityData = [
    // Microsoft — very active
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(2), title: 'Q1 Business Review', note: 'Discussed Azure consumption targets and new enterprise license terms. Azure spend tracking at 82% of EDP commitment.' },
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(7), title: 'License renewal discussion', note: 'Sent renewal proposal for Microsoft 365 E5 licenses. 3-year pricing locked.' },
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(10), title: 'Technical integration sync', note: 'Reviewed Teams integration roadmap and Copilot pilot rollout plan.' },
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(21), title: 'Microsoft Inspire attendance', note: 'Attended Microsoft Inspire partner summit. Strong pipeline sessions for FY25.' },
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'deal', date: daysAgo(45), title: 'Enterprise License Agreement', note: 'Signed 3-year ELA for Microsoft 365 — $1.2M ARR.' },
    { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'review', date: daysAgo(60), title: 'Annual Partner Review', note: 'Reviewed partnership KPIs: co-sell pipeline $4M, certifications +3 new.' },
    // Salesforce — active
    { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(5), title: 'CRM integration planning', note: 'Planned next phase of Salesforce CRM integration with ERP.' },
    { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(14), title: 'Support escalation review', note: 'Reviewed open support tickets and SLA compliance — 98% SLA achieved.' },
    { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(20), title: 'Einstein AI preview', note: 'Received preview of Salesforce Einstein AI capabilities for sales forecasting.' },
    { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(35), title: 'Dreamforce planning', note: 'Confirmed 4 speaker slots and booth at Dreamforce.' },
    // ServiceNow
    { partnerId: servicenow.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(8), title: 'ITSM workflow review', note: 'Reviewed automation capabilities — 45% ticket auto-resolution achieved.' },
    { partnerId: servicenow.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(18), title: 'SecOps module evaluation', note: 'Evaluating SecOps and HRSD modules for H2 expansion.' },
    { partnerId: servicenow.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(25), title: 'Monthly account check-in', note: 'Health check — usage growing, 300 new users onboarded.' },
    // SAP — at risk
    { partnerId: sap.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(45), title: 'S/4HANA migration discussion', note: 'Migration timeline slipped again to Q4 — resource constraints cited.' },
    { partnerId: sap.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(60), title: 'License audit', note: 'Annual license audit completed — 12 unused licenses identified.' },
    { partnerId: sap.id, managerId: mgrDavid.id, type: 'review', date: daysAgo(90), title: 'Q3 Partnership review', note: 'Below-target KPIs. Escalation memo drafted.' },
    // Atlassian
    { partnerId: atlassian.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(3), title: 'Jira Cloud migration', note: 'Migration from Jira Server to Cloud on track for May completion.' },
    { partnerId: atlassian.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(12), title: 'Confluence rollout', note: 'Organized Confluence training for 5 dev teams — 200 users.' },
    { partnerId: atlassian.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(28), title: 'Enterprise pricing', note: 'Negotiated volume discount for Atlassian suite — 15% saved.' },
    // Cisco — active
    { partnerId: cisco.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(4), title: 'Network refresh planning', note: 'Planned Q2 datacenter network refresh — 3 new Catalyst switches.' },
    { partnerId: cisco.id, managerId: mgrEmma.id, type: 'deal', date: daysAgo(15), title: 'SD-WAN deployment complete', note: 'SD-WAN deployed across all 12 sites — below budget by 8%.' },
    { partnerId: cisco.id, managerId: mgrEmma.id, type: 'email', date: daysAgo(22), title: 'Webex license renewal', note: 'Renewed Webex Enterprise licenses for 1,200 users.' },
    { partnerId: cisco.id, managerId: mgrEmma.id, type: 'review', date: daysAgo(50), title: 'Annual Partner Review', note: 'Gold status confirmed. Reviewed network health across all sites.' },
    // Dell
    { partnerId: dell.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(6), title: 'Server procurement', note: 'Quoted PowerEdge R750xa servers for new datacenter pod.' },
    { partnerId: dell.id, managerId: mgrEmma.id, type: 'deal', date: daysAgo(20), title: 'PowerStore purchase', note: 'PO signed for 2x Dell PowerStore 1200T arrays — $380k.' },
    { partnerId: dell.id, managerId: mgrEmma.id, type: 'call', date: daysAgo(35), title: 'ProSupport review', note: 'Reviewed ProSupport response SLAs — all within target.' },
    // HPE — at risk
    { partnerId: hpe.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(40), title: 'GreenLake evaluation', note: 'GreenLake consumption model evaluated — decision deferred to Q3.' },
    { partnerId: hpe.id, managerId: mgrEmma.id, type: 'email', date: daysAgo(55), title: 'Contract renewal notice', note: 'Received advance notice of support contract renewal due September.' },
    // AWS — very active
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(1), title: 'Cloud cost optimization', note: 'Reviewed RI strategy — projected $180k annual savings with new Savings Plans.' },
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'deal', date: daysAgo(8), title: 'EDP negotiation complete', note: 'EDP signed: $2M commitment over 36 months with 22% discount.' },
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(12), title: 're:Invent confirmation', note: 'Confirmed keynote speaking slot and 20x20 booth at AWS re:Invent.' },
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'call', date: daysAgo(18), title: 'Security compliance review', note: 'Reviewed shared responsibility model and SOC2 compliance posture.' },
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(25), title: 'Q2 Migration planning', note: 'Planned migration of 8 on-prem workloads to AWS in Q2.' },
    { partnerId: aws.id, managerId: mgrMichael.id, type: 'review', date: daysAgo(60), title: 'Annual Partnership Review', note: 'Comprehensive review — APN Tier Advanced confirmed, co-sell pipeline $6M.' },
    // Google Cloud
    { partnerId: gcloud.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(9), title: 'BigQuery pilot results', note: 'BigQuery data warehouse pilot completed — 40% query speed improvement vs legacy.' },
    { partnerId: gcloud.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(16), title: 'Vertex AI evaluation', note: 'Technical evaluation of Vertex AI for ML workloads — POC approved.' },
    { partnerId: gcloud.id, managerId: mgrMichael.id, type: 'call', date: daysAgo(22), title: 'Premier Partner tier discussion', note: 'Reviewed requirements for Premier Partner tier — 2 certifications outstanding.' },
    // Oracle
    { partnerId: oracle.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(15), title: 'OCI credits usage review', note: 'Reviewed OCI credit utilization — 67% consumed YTD.' },
    { partnerId: oracle.id, managerId: mgrMichael.id, type: 'call', date: daysAgo(30), title: 'Database licensing check', note: 'Confirmed Oracle DB licensing compliance audit passed.' },
    // CrowdStrike — active
    { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(3), title: 'Falcon XDR review', note: 'Reviewed Falcon XDR capabilities and expansion plan to cover cloud workloads.' },
    { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'deal', date: daysAgo(11), title: 'Endpoint expansion', note: 'Expanded CrowdStrike to 5,000 endpoints — 40% increase from last year.' },
    { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(20), title: 'Threat intelligence briefing', note: 'Received Q1 threat intelligence briefing — 3 APT groups targeting sector.' },
    { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'review', date: daysAgo(45), title: 'Security posture review', note: 'Annual security posture assessment — mean detection time improved to 8 min.' },
    // Palo Alto
    { partnerId: paloalto.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(12), title: 'SASE evaluation kickoff', note: 'Started formal SASE evaluation for 8 branch offices.' },
    { partnerId: paloalto.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(25), title: 'Panorama license review', note: 'Reviewed Panorama central management licensing — renewal in July.' },
    // Deloitte
    { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(7), title: 'Digital transformation strategy', note: 'Aligned on digital transformation roadmap for H2 — 5 workstreams confirmed.' },
    { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'deal', date: daysAgo(25), title: 'Cloud migration advisory signed', note: 'Signed advisory SOW for cloud migration program — $480k engagement.' },
    { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'email', date: daysAgo(35), title: 'Staffing confirmation', note: 'Deloitte confirmed 6 FTEs for Q2 engagement start.' },
    { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'call', date: daysAgo(14), title: 'Steering committee prep', note: 'Prepared steering committee materials for monthly governance review.' },
    // Accenture
    { partnerId: accenture.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(10), title: 'Data analytics project kickoff', note: 'Kicked off data analytics implementation — 4-month timeline, 3-person team.' },
    { partnerId: accenture.id, managerId: mgrPriya.id, type: 'email', date: daysAgo(22), title: 'Project status update', note: 'Phase 1 data discovery complete — 12 data sources mapped.' },
    // Cognizant — at risk
    { partnerId: cognizant.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(38), title: 'Service delivery review', note: 'Q1 SLA metrics reviewed — below 85% target in 3 of 5 KPIs.' },
    { partnerId: cognizant.id, managerId: mgrPriya.id, type: 'email', date: daysAgo(60), title: 'Performance improvement plan', note: 'Issued formal PIP — 60-day remediation window with weekly check-ins.' },
  ];

  for (const a of activityData) {
    await activityRepo.save(activityRepo.create(a as any));
  }

  console.log('✓ Activities seeded');

  // ─── Recalculate health scores ────────────────────────────────────────────
  const allPartners = await partnerRepo.find();
  const allActivities = await activityRepo.find({ order: { date: 'DESC' } });

  for (const partner of allPartners) {
    const partnerActivities = allActivities
      .filter((a) => a.partnerId === partner.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const score = computeHealthScore(partnerActivities);
    const status = computeStatus(score, partnerActivities);
    await partnerRepo.update(partner.id, { healthScore: score, status });
  }

  console.log('✓ Health scores calculated');

  // ─── Deals ────────────────────────────────────────────────────────────────
  const futureDate = (n: number) => dayjs().add(n, 'day').format('YYYY-MM-DD');

  const dealData = [
    { partnerId: microsoft.id, partnerName: 'Microsoft', customerName: 'Viettel Group', dealValue: 280000, expectedCloseDate: futureDate(30), status: 'In Progress' as const, businessUnit: 'HSI' as const, description: 'Microsoft 365 E5 + Azure EDP for 3,000 seats' },
    { partnerId: microsoft.id, partnerName: 'Microsoft', customerName: 'VPBank', dealValue: 150000, expectedCloseDate: futureDate(15), status: 'Won' as const, businessUnit: 'HSC' as const, description: 'Microsoft Copilot pilot deployment' },
    { partnerId: cisco.id, partnerName: 'Cisco', customerName: 'VNPT', dealValue: 320000, expectedCloseDate: futureDate(45), status: 'In Progress' as const, businessUnit: 'HSI' as const, description: 'Campus SD-WAN transformation 12 sites' },
    { partnerId: cisco.id, partnerName: 'Cisco', customerName: 'MoIT', dealValue: 95000, expectedCloseDate: futureDate(-10), status: 'Won' as const, businessUnit: 'HAS' as const, description: 'Cisco Catalyst 9000 network refresh' },
    { partnerId: aws.id, partnerName: 'AWS', customerName: 'Techcombank', dealValue: 480000, expectedCloseDate: futureDate(60), status: 'Pending' as const, businessUnit: 'HSC' as const, description: 'AWS cloud migration — core banking workloads' },
    { partnerId: aws.id, partnerName: 'AWS', customerName: 'FPT Software', dealValue: 210000, expectedCloseDate: futureDate(20), status: 'In Progress' as const, businessUnit: 'HSI' as const, description: 'AWS re:Start and DevOps toolchain' },
    { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', customerName: 'Petrovietnam', dealValue: 75000, expectedCloseDate: futureDate(25), status: 'In Progress' as const, businessUnit: 'HSE' as const, description: 'Falcon XDR + Identity Protection bundle' },
    { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', customerName: 'VinGroup', dealValue: 120000, expectedCloseDate: futureDate(-5), status: 'Won' as const, businessUnit: 'HSE' as const, description: 'Full Falcon platform 8,000 endpoints' },
    { partnerId: salesforce.id, partnerName: 'Salesforce', customerName: 'Masan Group', dealValue: 95000, expectedCloseDate: futureDate(40), status: 'Pending' as const, businessUnit: 'HSC' as const, description: 'Sales Cloud + Service Cloud enterprise rollout' },
    { partnerId: dell.id, partnerName: 'Dell Technologies', customerName: 'Vietnam Airlines', dealValue: 560000, expectedCloseDate: futureDate(50), status: 'In Progress' as const, businessUnit: 'HSV' as const, description: 'PowerEdge server refresh + VxRail HCI cluster' },
    { partnerId: deloitte.id, partnerName: 'Deloitte', customerName: 'Vietcombank', dealValue: 340000, expectedCloseDate: futureDate(-20), status: 'Won' as const, businessUnit: 'HAS' as const, description: 'Digital transformation advisory SOW Phase 2' },
    { partnerId: paloalto.id, partnerName: 'Palo Alto Networks', customerName: 'HCMC Tax Dept', dealValue: 88000, expectedCloseDate: futureDate(35), status: 'In Progress' as const, businessUnit: 'HSE' as const, description: 'Prisma Access SASE 12 branches' },
    { partnerId: gcloud.id, partnerName: 'Google Cloud', customerName: 'Grab Vietnam', dealValue: 195000, expectedCloseDate: futureDate(55), status: 'Pending' as const, businessUnit: 'HSI' as const, description: 'BigQuery + Vertex AI analytics platform' },
    { partnerId: servicenow.id, partnerName: 'ServiceNow', customerName: 'EVN', dealValue: 165000, expectedCloseDate: futureDate(-30), status: 'Lost' as const, businessUnit: 'HAS' as const, description: 'ITSM + HRSD implementation lost to competitor' },
    { partnerId: hpe.id, partnerName: 'HPE', customerName: 'Vietnam Post', dealValue: 240000, expectedCloseDate: futureDate(70), status: 'Pending' as const, businessUnit: 'HSV' as const, description: 'HPE GreenLake infrastructure-as-a-service' },
  ];

  for (const d of dealData) {
    await dealRepo.save(dealRepo.create(d as any));
  }
  console.log('✓ Deals seeded');

  // ─── Funds ────────────────────────────────────────────────────────────────
  const fundData = [
    // Microsoft
    { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 250000, receivedAmount: 150000, spentAmount: 80000, claimStatus: 'Approved' as const, notes: 'Based on Q1+Q2 Azure consumption targets (120%+ attainment)' },
    { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 80000, receivedAmount: 80000, spentAmount: 45000, claimStatus: 'Paid' as const, notes: 'Go-to-market investment fund FY25 — co-sell motions' },
    { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 30000, receivedAmount: 20000, spentAmount: 18500, claimStatus: 'Submitted' as const, notes: 'Ignite Vietnam 2025 event co-sponsorship' },
    // Cisco
    { partnerId: cisco.id, partnerName: 'Cisco', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 180000, receivedAmount: 90000, spentAmount: 0, claimStatus: 'Submitted' as const, notes: 'H1 FY25 back-end rebate — 115% revenue attainment' },
    { partnerId: cisco.id, partnerName: 'Cisco', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 25000, receivedAmount: 25000, spentAmount: 22000, claimStatus: 'Paid' as const, notes: 'Partner event + customer breakfast seminars' },
    // AWS
    { partnerId: aws.id, partnerName: 'AWS', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 120000, receivedAmount: 60000, spentAmount: 30000, claimStatus: 'Approved' as const, notes: 'AWS Partner Activation Fund — consulting engagements' },
    { partnerId: aws.id, partnerName: 'AWS', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 40000, receivedAmount: 40000, spentAmount: 35000, claimStatus: 'Paid' as const, notes: 'AWS Summit Vietnam sponsorship + demo booth' },
    // CrowdStrike
    { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 65000, receivedAmount: 0, spentAmount: 0, claimStatus: 'Pending' as const, notes: 'FY25 annual rebate — claim in Q4' },
    { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 15000, receivedAmount: 15000, spentAmount: 12000, claimStatus: 'Paid' as const, notes: 'CrowdStrike Fal.Con regional event' },
    // Dell Technologies
    { partnerId: dell.id, partnerName: 'Dell Technologies', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 200000, receivedAmount: 100000, spentAmount: 0, claimStatus: 'Approved' as const, notes: 'Q2 sell-through rebate — infrastructure products' },
    { partnerId: dell.id, partnerName: 'Dell Technologies', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 50000, receivedAmount: 50000, spentAmount: 28000, claimStatus: 'Paid' as const, notes: 'Dell Titanium partner enablement fund' },
    // Deloitte
    { partnerId: deloitte.id, partnerName: 'Deloitte', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 35000, receivedAmount: 35000, spentAmount: 35000, claimStatus: 'Paid' as const, notes: 'Joint go-to-market fund — digital transformation practice' },
    // Google Cloud
    { partnerId: gcloud.id, partnerName: 'Google Cloud', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 80000, receivedAmount: 40000, spentAmount: 15000, claimStatus: 'Approved' as const, notes: 'Google Partner Incentive Fund — data & AI specialization' },
    { partnerId: gcloud.id, partnerName: 'Google Cloud', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 20000, receivedAmount: 0, spentAmount: 0, claimStatus: 'Pending' as const, notes: 'Google Cloud Next Vietnam event — awaiting approval' },
  ];

  for (const f of fundData) {
    await fundRepo.save(fundRepo.create(f as any));
  }
  console.log('✓ Funds seeded');

  console.log('\n🎉 Seed complete!');
  console.log('\n─── Login Credentials ────────────────────────────');
  console.log('Admin:   admin@company.com          / password123');
  console.log('Manager: david.kim@company.com      / password123');
  console.log('Manager: emma.rodriguez@company.com / password123');
  console.log('Manager: michael.zhang@company.com  / password123');
  console.log('Manager: priya.patel@company.com    / password123');
  console.log('──────────────────────────────────────────────────\n');

  await dataSource.destroy();
}

function computeHealthScore(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const now = dayjs();
  const lastActivity = dayjs(activities[0].date);
  const daysSinceLast = now.diff(lastActivity, 'day');

  let recency: number;
  if (daysSinceLast <= 7) recency = 50;
  else if (daysSinceLast <= 14) recency = 40;
  else if (daysSinceLast <= 30) recency = 30;
  else if (daysSinceLast <= 60) recency = 15;
  else recency = 0;

  const cutoff90 = now.subtract(90, 'day');
  const count90 = activities.filter((a) => dayjs(a.date).isAfter(cutoff90)).length;
  let volume: number;
  if (count90 >= 10) volume = 30;
  else if (count90 >= 6) volume = 25;
  else if (count90 >= 3) volume = 20;
  else if (count90 >= 1) volume = 10;
  else volume = 0;

  const cutoff30 = now.subtract(30, 'day');
  const count30 = activities.filter((a) => dayjs(a.date).isAfter(cutoff30)).length;
  let engagement: number;
  if (count30 >= 3) engagement = 20;
  else if (count30 >= 2) engagement = 15;
  else if (count30 >= 1) engagement = 10;
  else engagement = 0;

  return Math.min(100, Math.max(0, recency + volume + engagement));
}

function computeStatus(
  score: number,
  activities: Activity[],
): 'Active' | 'Risk' | 'Inactive' {
  if (activities.length === 0) return 'Inactive';
  const now = dayjs();
  const daysSinceLast = now.diff(dayjs(activities[0].date), 'day');
  if (daysSinceLast > 90 && score < 10) return 'Inactive';
  if (daysSinceLast >= 30 || score < 40) return 'Risk';
  return 'Active';
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

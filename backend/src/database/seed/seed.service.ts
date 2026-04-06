import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dayjsLib from 'dayjs';
const dayjs = (dayjsLib as any).default ?? dayjsLib;
import { Employee } from '../../modules/employees/employee.entity';
import { Domain } from '../../modules/domains/domain.entity';
import { Partner } from '../../modules/partners/partner.entity';
import { Activity } from '../../modules/activities/activity.entity';
import { Deal } from '../../modules/deals/deal.entity';
import { Fund } from '../../modules/funds/fund.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Domain) private domainRepo: Repository<Domain>,
    @InjectRepository(Partner) private partnerRepo: Repository<Partner>,
    @InjectRepository(Activity) private activityRepo: Repository<Activity>,
    @InjectRepository(Deal) private dealRepo: Repository<Deal>,
    @InjectRepository(Fund) private fundRepo: Repository<Fund>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.empRepo.count();
    if (count > 0) return;
    this.logger.log('Empty database detected — running auto-seed...');
    try {
      await this.runSeed();
      this.logger.log('Auto-seed complete.');
    } catch (err) {
      this.logger.error('Auto-seed failed', err);
    }
  }

  private async runSeed() {
    const daysAgo = (n: number) => dayjs().subtract(n, 'day').format('YYYY-MM-DD');
    const futureDate = (n: number) => dayjs().add(n, 'day').format('YYYY-MM-DD');

    // Domains
    const domains = await this.domainRepo.save([
      { name: 'Software', description: 'SaaS and software platform partnerships', colorHex: '#1890ff' },
      { name: 'Hardware', description: 'Device and infrastructure partners', colorHex: '#52c41a' },
      { name: 'Cloud Services', description: 'Cloud platform and IaaS/PaaS', colorHex: '#fa8c16' },
      { name: 'Security', description: 'Cybersecurity and compliance partners', colorHex: '#f5222d' },
      { name: 'Professional Services', description: 'Consulting and SI partners', colorHex: '#722ed1' },
    ]);
    const [sw, hw, cloud, sec, ps] = domains;
    this.logger.log('✓ Domains');

    // Employees
    const hashedPw = await bcrypt.hash('password123', 10);
    await this.empRepo.save({
      name: 'Sarah Chen', email: 'admin@company.com', password: hashedPw,
      role: 'admin' as const, title: 'Head of Partnerships',
    });
    const managers = await this.empRepo.save([
      { name: 'David Kim', email: 'david.kim@company.com', password: hashedPw, role: 'manager' as const, title: 'Software Domain Lead' },
      { name: 'Emma Rodriguez', email: 'emma.rodriguez@company.com', password: hashedPw, role: 'manager' as const, title: 'Infrastructure Domain Lead' },
      { name: 'Michael Zhang', email: 'michael.zhang@company.com', password: hashedPw, role: 'manager' as const, title: 'Cloud & Security Domain Lead' },
      { name: 'Priya Patel', email: 'priya.patel@company.com', password: hashedPw, role: 'manager' as const, title: 'Professional Services Lead' },
    ]);
    const [mgrDavid, mgrEmma, mgrMichael, mgrPriya] = managers;
    this.logger.log('✓ Employees');

    // Partners
    const partnerData: Partial<Partner>[] = [
      { name: 'Microsoft', domainId: sw.id, managerId: mgrDavid.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'Microsoft 365 and Azure integration partnership.', logoUrl: null, officialLinks: [{ label: 'Vendor Portal', url: 'https://partner.microsoft.com' }], contactInfo: { email: 'enterprise@microsoft.com', contactName: 'Alex Turner (Partner TAM)' }, notes: 'Annual QBR in Q1. Renewal window: October each year.' },
      { name: 'Salesforce', domainId: sw.id, managerId: mgrDavid.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'CRM platform partnership with co-implementation and AppExchange ISV program.', officialLinks: [{ label: 'Partner Community', url: 'https://partners.salesforce.com' }], contactInfo: { email: 'alliances@salesforce.com', contactName: 'Maria Gonzalez' }, notes: 'ISV certification renewal due in June.' },
      { name: 'ServiceNow', domainId: sw.id, managerId: mgrDavid.id, priorityLevel: 'Key', status: 'Active', healthScore: 0, description: 'ITSM and workflow automation platform.', officialLinks: [], contactInfo: { email: 'partners@servicenow.com', contactName: 'Tom Bradley' }, notes: 'Focus on SecOps and HR modules for H2.' },
      { name: 'SAP', domainId: sw.id, managerId: mgrDavid.id, priorityLevel: 'Key', status: 'Risk', healthScore: 0, description: 'ERP and enterprise software. S/4HANA migration stalled.', officialLinks: [], contactInfo: { email: 'enterprise@sap.com' }, notes: 'Migration timeline slipped twice. Escalate if no progress by Q2.' },
      { name: 'Atlassian', domainId: sw.id, managerId: mgrDavid.id, priorityLevel: 'Normal', status: 'Active', healthScore: 0, description: 'Dev tools and project management — Jira, Confluence, Bitbucket.', officialLinks: [], contactInfo: { email: 'partners@atlassian.com' }, notes: 'Cloud migration ongoing.' },
      { name: 'Cisco', domainId: hw.id, managerId: mgrEmma.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'Networking infrastructure — SD-WAN, Catalyst, Webex.', officialLinks: [{ label: 'Partner Portal', url: 'https://partners.cisco.com' }], contactInfo: { email: 'partners@cisco.com', contactName: 'James Wong' }, notes: 'Gold status. Annual partner review in Q3.' },
      { name: 'Dell Technologies', domainId: hw.id, managerId: mgrEmma.id, priorityLevel: 'Key', status: 'Active', healthScore: 0, description: 'Servers, storage, and HCI solutions.', officialLinks: [], contactInfo: { email: 'partners@dell.com' }, notes: 'Titanium tier partner. Strong storage pipeline.' },
      { name: 'HPE', domainId: hw.id, managerId: mgrEmma.id, priorityLevel: 'Key', status: 'Risk', healthScore: 0, description: 'HPE GreenLake and ProLiant server portfolio.', officialLinks: [], contactInfo: { email: 'partners@hpe.com' }, notes: 'GreenLake decision deferred. No recent engagement.' },
      { name: 'AWS', domainId: cloud.id, managerId: mgrMichael.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'AWS cloud — EDP, co-sell, migration programs.', officialLinks: [{ label: 'APN Portal', url: 'https://aws.amazon.com/partners' }], contactInfo: { email: 'aws-partners@amazon.com', contactName: 'Lisa Park' }, notes: 'Advanced APN tier. EDP signed $2M.' },
      { name: 'Google Cloud', domainId: cloud.id, managerId: mgrMichael.id, priorityLevel: 'Key', status: 'Active', healthScore: 0, description: 'GCP — BigQuery, Vertex AI, Workspace.', officialLinks: [], contactInfo: { email: 'partners@google.com' }, notes: 'Premier Partner tier pending 2 certifications.' },
      { name: 'Oracle', domainId: cloud.id, managerId: mgrMichael.id, priorityLevel: 'Normal', status: 'Active', healthScore: 0, description: 'Oracle Cloud and database licensing.', officialLinks: [], contactInfo: { email: 'partners@oracle.com' }, notes: 'OCI credits 67% consumed YTD.' },
      { name: 'CrowdStrike', domainId: sec.id, managerId: mgrMichael.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'Falcon XDR endpoint and cloud security platform.', officialLinks: [], contactInfo: { email: 'partners@crowdstrike.com' }, notes: '5,000 endpoints. Renewal in November.' },
      { name: 'Palo Alto Networks', domainId: sec.id, managerId: mgrMichael.id, priorityLevel: 'Key', status: 'Active', healthScore: 0, description: 'SASE, Prisma Access, and Panorama NGFW.', officialLinks: [], contactInfo: { email: 'partners@paloaltonetworks.com' }, notes: 'SASE evaluation for 8 branch offices.' },
      { name: 'Deloitte', domainId: ps.id, managerId: mgrPriya.id, priorityLevel: 'Strategic', status: 'Active', healthScore: 0, description: 'Digital transformation advisory and implementation.', officialLinks: [], contactInfo: { email: 'alliances@deloitte.com', contactName: 'Rachel Kim' }, notes: 'Phase 2 SOW signed. 6 FTEs confirmed for Q2.' },
      { name: 'Accenture', domainId: ps.id, managerId: mgrPriya.id, priorityLevel: 'Key', status: 'Active', healthScore: 0, description: 'Data analytics and cloud implementation services.', officialLinks: [], contactInfo: { email: 'alliances@accenture.com' }, notes: 'Analytics Phase 1 complete. Phase 2 scoping.' },
      { name: 'Cognizant', domainId: ps.id, managerId: mgrPriya.id, priorityLevel: 'Normal', status: 'Risk', healthScore: 0, description: 'Managed services and application outsourcing.', officialLinks: [], contactInfo: { email: 'alliances@cognizant.com' }, notes: 'PIP issued — 60-day remediation window.' },
    ];

    const savedPartners = await this.partnerRepo.save(partnerData as Partner[]);
    const pmap = Object.fromEntries(savedPartners.map(p => [p.name, p]));
    const [microsoft, salesforce, servicenow, sap, atlassian, cisco, dell, hpe, aws, gcloud, oracle, crowdstrike, paloalto, deloitte, accenture, cognizant] = savedPartners;
    this.logger.log('✓ Partners');

    // Activities
    const activityData = [
      { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(2), title: 'Q1 Business Review', note: 'Reviewed Azure consumption and enterprise license terms.' },
      { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(7), title: 'License renewal discussion', note: 'Sent renewal proposal for Microsoft 365 E5 licenses.' },
      { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(10), title: 'Technical integration sync', note: 'Reviewed Teams integration roadmap and Copilot pilot.' },
      { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(21), title: 'Microsoft Inspire attendance', note: 'Attended Microsoft Inspire partner summit.' },
      { partnerId: microsoft.id, managerId: mgrDavid.id, type: 'deal', date: daysAgo(45), title: 'Enterprise License Agreement', note: 'Signed 3-year ELA for Microsoft 365 — $1.2M ARR.' },
      { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(5), title: 'CRM integration planning', note: 'Planned next phase of Salesforce CRM integration.' },
      { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'call', date: daysAgo(14), title: 'Support escalation review', note: '98% SLA achieved last quarter.' },
      { partnerId: salesforce.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(35), title: 'Dreamforce planning', note: 'Confirmed 4 speaker slots and booth at Dreamforce.' },
      { partnerId: servicenow.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(8), title: 'ITSM workflow review', note: '45% ticket auto-resolution achieved.' },
      { partnerId: servicenow.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(18), title: 'SecOps module evaluation', note: 'Evaluating SecOps and HRSD modules for H2.' },
      { partnerId: sap.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(45), title: 'S/4HANA migration discussion', note: 'Migration timeline slipped again to Q4.' },
      { partnerId: sap.id, managerId: mgrDavid.id, type: 'review', date: daysAgo(90), title: 'Q3 Partnership review', note: 'Below-target KPIs. Escalation memo drafted.' },
      { partnerId: atlassian.id, managerId: mgrDavid.id, type: 'email', date: daysAgo(3), title: 'Jira Cloud migration', note: 'Migration on track for May completion.' },
      { partnerId: atlassian.id, managerId: mgrDavid.id, type: 'meeting', date: daysAgo(12), title: 'Confluence rollout', note: 'Training organized for 5 dev teams.' },
      { partnerId: cisco.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(4), title: 'Network refresh planning', note: 'Planned Q2 datacenter network refresh.' },
      { partnerId: cisco.id, managerId: mgrEmma.id, type: 'deal', date: daysAgo(15), title: 'SD-WAN deployment complete', note: 'SD-WAN deployed across all 12 sites.' },
      { partnerId: cisco.id, managerId: mgrEmma.id, type: 'email', date: daysAgo(22), title: 'Webex license renewal', note: 'Renewed Webex Enterprise for 1,200 users.' },
      { partnerId: dell.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(6), title: 'Server procurement', note: 'Quoted PowerEdge R750xa servers for new datacenter pod.' },
      { partnerId: dell.id, managerId: mgrEmma.id, type: 'deal', date: daysAgo(20), title: 'PowerStore purchase', note: 'PO signed for 2x Dell PowerStore 1200T — $380k.' },
      { partnerId: hpe.id, managerId: mgrEmma.id, type: 'meeting', date: daysAgo(40), title: 'GreenLake evaluation', note: 'GreenLake decision deferred to Q3.' },
      { partnerId: hpe.id, managerId: mgrEmma.id, type: 'email', date: daysAgo(55), title: 'Contract renewal notice', note: 'Support contract renewal due September.' },
      { partnerId: aws.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(1), title: 'Cloud cost optimization', note: 'Projected $180k annual savings with new Savings Plans.' },
      { partnerId: aws.id, managerId: mgrMichael.id, type: 'deal', date: daysAgo(8), title: 'EDP negotiation complete', note: 'EDP signed: $2M commitment over 36 months with 22% discount.' },
      { partnerId: aws.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(25), title: 'Q2 Migration planning', note: 'Planned migration of 8 on-prem workloads to AWS.' },
      { partnerId: gcloud.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(9), title: 'BigQuery pilot results', note: 'BigQuery pilot: 40% query speed improvement vs legacy.' },
      { partnerId: gcloud.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(16), title: 'Vertex AI evaluation', note: 'POC approved for ML workloads.' },
      { partnerId: oracle.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(15), title: 'OCI credits usage review', note: 'OCI credit utilization 67% YTD.' },
      { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(3), title: 'Falcon XDR review', note: 'Expansion plan to cover cloud workloads.' },
      { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'deal', date: daysAgo(11), title: 'Endpoint expansion', note: 'Expanded to 5,000 endpoints — 40% increase.' },
      { partnerId: crowdstrike.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(20), title: 'Threat intelligence briefing', note: 'Q1 threat intelligence briefing received.' },
      { partnerId: paloalto.id, managerId: mgrMichael.id, type: 'meeting', date: daysAgo(12), title: 'SASE evaluation kickoff', note: 'Formal SASE evaluation for 8 branch offices.' },
      { partnerId: paloalto.id, managerId: mgrMichael.id, type: 'email', date: daysAgo(25), title: 'Panorama license review', note: 'Panorama renewal due July.' },
      { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(7), title: 'Digital transformation strategy', note: '5 workstreams confirmed for H2.' },
      { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'deal', date: daysAgo(25), title: 'Cloud migration advisory signed', note: 'Advisory SOW Phase 2 — $480k engagement.' },
      { partnerId: deloitte.id, managerId: mgrPriya.id, type: 'call', date: daysAgo(14), title: 'Steering committee prep', note: 'Prepared monthly governance review materials.' },
      { partnerId: accenture.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(10), title: 'Data analytics project kickoff', note: '4-month timeline, 3-person team.' },
      { partnerId: accenture.id, managerId: mgrPriya.id, type: 'email', date: daysAgo(22), title: 'Project status update', note: 'Phase 1 data discovery complete — 12 data sources mapped.' },
      { partnerId: cognizant.id, managerId: mgrPriya.id, type: 'meeting', date: daysAgo(38), title: 'Service delivery review', note: 'Q1 SLA: below 85% target in 3 of 5 KPIs.' },
      { partnerId: cognizant.id, managerId: mgrPriya.id, type: 'email', date: daysAgo(60), title: 'Performance improvement plan', note: 'Formal PIP issued — 60-day remediation.' },
    ];

    for (const a of activityData) {
      await this.activityRepo.save(this.activityRepo.create(a as any));
    }
    this.logger.log('✓ Activities');

    // Recalculate health scores
    const allPartners = await this.partnerRepo.find();
    const allActivities = await this.activityRepo.find({ order: { date: 'DESC' } });
    for (const partner of allPartners) {
      const acts = allActivities.filter(a => a.partnerId === partner.id).sort((a, b) => a.date < b.date ? 1 : -1);
      const score = this.computeHealth(acts);
      const status = this.computeStatus(score, acts);
      await this.partnerRepo.update(partner.id, { healthScore: score, status });
    }

    // Deals
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
      await this.dealRepo.save(this.dealRepo.create(d as any));
    }
    this.logger.log('✓ Deals');

    // Funds
    const fundData = [
      { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 250000, receivedAmount: 150000, spentAmount: 80000, claimStatus: 'Approved' as const, notes: 'Q1+Q2 Azure consumption rebate (120%+ attainment)' },
      { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 80000, receivedAmount: 80000, spentAmount: 45000, claimStatus: 'Paid' as const, notes: 'Go-to-market investment fund FY25' },
      { partnerId: microsoft.id, partnerName: 'Microsoft', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 30000, receivedAmount: 20000, spentAmount: 18500, claimStatus: 'Submitted' as const, notes: 'Ignite Vietnam 2025 co-sponsorship' },
      { partnerId: cisco.id, partnerName: 'Cisco', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 180000, receivedAmount: 90000, spentAmount: 0, claimStatus: 'Submitted' as const, notes: 'H1 FY25 back-end rebate — 115% revenue attainment' },
      { partnerId: cisco.id, partnerName: 'Cisco', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 25000, receivedAmount: 25000, spentAmount: 22000, claimStatus: 'Paid' as const, notes: 'Partner event + customer breakfast seminars' },
      { partnerId: aws.id, partnerName: 'AWS', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 120000, receivedAmount: 60000, spentAmount: 30000, claimStatus: 'Approved' as const, notes: 'AWS Partner Activation Fund — consulting engagements' },
      { partnerId: aws.id, partnerName: 'AWS', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 40000, receivedAmount: 40000, spentAmount: 35000, claimStatus: 'Paid' as const, notes: 'AWS Summit Vietnam sponsorship' },
      { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 65000, receivedAmount: 0, spentAmount: 0, claimStatus: 'Pending' as const, notes: 'FY25 annual rebate — claim in Q4' },
      { partnerId: crowdstrike.id, partnerName: 'CrowdStrike', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 15000, receivedAmount: 15000, spentAmount: 12000, claimStatus: 'Paid' as const, notes: 'CrowdStrike Fal.Con regional event' },
      { partnerId: dell.id, partnerName: 'Dell Technologies', fundType: 'Rebate' as const, fiscalYear: 2025, totalAmount: 200000, receivedAmount: 100000, spentAmount: 0, claimStatus: 'Approved' as const, notes: 'Q2 sell-through rebate — infrastructure products' },
      { partnerId: dell.id, partnerName: 'Dell Technologies', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 50000, receivedAmount: 50000, spentAmount: 28000, claimStatus: 'Paid' as const, notes: 'Dell Titanium partner enablement fund' },
      { partnerId: deloitte.id, partnerName: 'Deloitte', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 35000, receivedAmount: 35000, spentAmount: 35000, claimStatus: 'Paid' as const, notes: 'Joint go-to-market fund — digital transformation' },
      { partnerId: gcloud.id, partnerName: 'Google Cloud', fundType: 'Program Fund' as const, fiscalYear: 2025, totalAmount: 80000, receivedAmount: 40000, spentAmount: 15000, claimStatus: 'Approved' as const, notes: 'Google Partner Incentive Fund — data & AI' },
      { partnerId: gcloud.id, partnerName: 'Google Cloud', fundType: 'Marketing Fund' as const, fiscalYear: 2025, totalAmount: 20000, receivedAmount: 0, spentAmount: 0, claimStatus: 'Pending' as const, notes: 'Google Cloud Next Vietnam — awaiting approval' },
    ];
    for (const f of fundData) {
      await this.fundRepo.save(this.fundRepo.create(f as any));
    }
    this.logger.log('✓ Funds');
  }

  private computeHealth(activities: Activity[]): number {
    if (!activities.length) return 0;
    const now = dayjs();
    const days = now.diff(dayjs(activities[0].date), 'day');
    let recency = days <= 7 ? 50 : days <= 14 ? 40 : days <= 30 ? 30 : days <= 60 ? 15 : 0;
    const cut90 = now.subtract(90, 'day');
    const count90 = activities.filter(a => dayjs(a.date).isAfter(cut90)).length;
    let volume = count90 >= 10 ? 30 : count90 >= 6 ? 25 : count90 >= 3 ? 20 : count90 >= 1 ? 10 : 0;
    const cut30 = now.subtract(30, 'day');
    const count30 = activities.filter(a => dayjs(a.date).isAfter(cut30)).length;
    let engagement = count30 >= 3 ? 20 : count30 >= 2 ? 15 : count30 >= 1 ? 10 : 0;
    return Math.min(100, recency + volume + engagement);
  }

  private computeStatus(score: number, activities: Activity[]): 'Active' | 'Risk' | 'Inactive' {
    if (!activities.length) return 'Inactive';
    const days = dayjs().diff(dayjs(activities[0].date), 'day');
    if (days > 90 && score < 10) return 'Inactive';
    if (days >= 30 || score < 40) return 'Risk';
    return 'Active';
  }
}

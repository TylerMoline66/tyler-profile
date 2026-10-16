import type { PlanetSection } from '../types'

export const profileMeta = {
  name: 'Tyler Moline',
  title: 'Full-Stack Software Engineer · Technical Lead',
  tagline: 'Explore my universe — click any planet to dive in.',
}

export const planets: PlanetSection[] = [
  {
    id: 'about',
    name: 'About Me',
    tagline: 'Who I am & what drives me',
    color: '#4a90d9',
    emissive: '#1a3a6a',
    position: [0, -3.5, 0],
    size: 2.2,
    rotationSpeed: 0.15,
    content: {
      headline: 'About Me',
      summary:
        'Full-stack software engineer with 3+ years building and shipping production SaaS applications. Career changer from construction management — I bring an ownership mindset, bias for action, and follow-through to every project. Based in Lehi, UT.',
      items: [
        {
          title: 'Location',
          description: 'Lehi, Utah — open to local, hybrid, and remote opportunities.',
        },
        {
          title: 'What I Do',
          description:
            'Own features end-to-end across React frontends, Python/Flask backends, PostgreSQL databases, and REST APIs — from planning and architecture through deployment and support.',
        },
        {
          title: 'How I Work',
          description:
            'Technical lead who mentors developers, runs code reviews, and partners with product and stakeholders. I use AI tools daily (Claude, Cursor, Copilot) to ship faster without sacrificing quality.',
        },
        {
          title: 'Background',
          description:
            'Entered software engineering by deliberate choice in 2022 after intensive full-stack training. The same qualities that made me effective in construction — ownership, adaptability, getting things done under pressure — are what I bring to engineering.',
        },
      ],
    },
  },
  {
    id: 'experience',
    name: 'Experience',
    tagline: 'Where I\'ve worked & what I\'ve shipped',
    color: '#e07b39',
    emissive: '#6b3010',
    position: [-15, 2, -7],
    size: 1.8,
    hasRings: true,
    rotationSpeed: 0.1,
    content: {
      headline: 'Work Experience',
      summary:
        '3+ years at DevPipeline building production SaaS, leading engineering teams, and delivering under real constraints.',
      items: [
        {
          title: 'Team Lead & Full-Stack Engineer',
          subtitle: 'DevPipeline · Lehi, UT · 2022 – Present',
          description:
            'Design, develop, and maintain production SaaS applications while leading teams of 5–15 developers across concurrent client projects.',
          tags: ['React', 'Python', 'Flask', 'PostgreSQL', 'Leadership'],
        },
        {
          title: 'TaskWize Data Migration',
          subtitle: 'DevPipeline · End-to-End Ownership',
          description:
            'Assessed a codebase unmaintained for over a year, architected migration from legacy schema to updated data model, and executed full ETL with zero data loss.',
          tags: ['ETL', 'PostgreSQL', 'Schema Design', 'Data Migration'],
        },
        {
          title: 'Monument Quest',
          subtitle: 'DevPipeline · Mid-Project Takeover',
          description:
            'Inherited an in-progress codebase, stabilized it, hit delivery deadlines, and independently extended the product beyond original specs as requirements evolved.',
          tags: ['React', 'Flask', 'Product Ownership'],
        },
        {
          title: 'Basin IE Coverage',
          subtitle: 'DevPipeline · Critical Staffing Gap',
          description:
            'Absorbed a second team\'s full workload during a staffing gap — maintained pipeline stability and delivery continuity without client disruption.',
          tags: ['Team Leadership', 'Delivery', 'Ownership'],
        },
      ],
    },
  },
  {
    id: 'education',
    name: 'Education',
    tagline: 'Training, background & growth',
    color: '#7b5ea7',
    emissive: '#2e1f4a',
    position: [15, -2, -7],
    size: 1.5,
    rotationSpeed: 0.12,
    content: {
      headline: 'Education & Background',
      summary:
        'Intensive engineering training plus continuous self-directed learning in distributed systems and backend depth.',
      items: [
        {
          title: 'Full-Stack Engineering Training',
          subtitle: '2021 – 2022',
          description:
            'Intensive full-stack engineering program completed prior to entering the industry — foundation in algorithms, data structures, system design, and production development practices.',
          tags: ['Algorithms', 'Data Structures', 'System Design'],
        },
        {
          title: 'Career Transition',
          subtitle: 'Construction Management → Software Engineering',
          description:
            'Career changer who pursued software engineering by deliberate choice. Brought ownership, adaptability, and follow-through from years in construction management.',
        },
        {
          title: 'Currently Learning',
          description:
            'Deepening distributed systems knowledge — Java, Spring, Go, Kafka, Kubernetes, and automated testing frameworks (Jest, JUnit).',
          tags: ['Java', 'Spring', 'Go', 'Kafka', 'Kubernetes'],
        },
      ],
    },
  },
  {
    id: 'skills',
    name: 'Skills',
    tagline: 'Languages, frameworks & tools',
    color: '#3ecf8e',
    emissive: '#0d4a2e',
    position: [14, 3, -13],
    size: 1.4,
    rotationSpeed: 0.2,
    content: {
      headline: 'Skills & Tools',
      summary:
        'Full-stack range with a strong lean toward backend systems, data pipelines, API integration, and service reliability.',
      items: [
        {
          title: 'Languages',
          tags: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML/CSS'],
        },
        {
          title: 'Frontend',
          tags: ['React', 'SCSS', 'Responsive Design', 'Component Architecture', 'State Management'],
        },
        {
          title: 'Backend & Data',
          tags: ['Flask', 'Node.js', 'REST APIs', 'PostgreSQL', 'SQLAlchemy', 'ETL', 'OAuth'],
        },
        {
          title: 'Infrastructure & Practices',
          tags: ['AWS', 'Docker', 'Git', 'CI/CD', 'Heroku', 'Vercel', 'Agile', 'Code Reviews'],
        },
        {
          title: 'AI & Development',
          tags: ['Claude API', 'Cursor', 'GitHub Copilot', 'ChatGPT', 'Workflow Automation'],
        },
      ],
    },
  },
  {
    id: 'projects',
    name: 'Projects',
    tagline: 'Production builds & shipped work',
    color: '#e0527e',
    emissive: '#5c1a30',
    position: [-13, -8, -8],
    size: 1.6,
    rotationSpeed: 0.18,
    content: {
      headline: 'Selected Projects',
      summary:
        'Production SaaS platforms, AI integrations, and client applications — not prototypes, real shipped software.',
      items: [
        {
          title: 'Monument Quest',
          subtitle: 'Production SaaS · React + Flask + PostgreSQL',
          description:
            'Location-based SaaS platform for building workflow-driven applications. Owned full-stack development — relational schema design, REST APIs, and complex state-driven React UI.',
          tags: ['React', 'Flask', 'PostgreSQL', 'REST APIs'],
        },
        {
          title: 'Clawbot',
          subtitle: 'AI Integration · Claude API',
          description:
            'Multi-tenant AI-powered email assistant. Built full pipeline: inbound email → Claude API processing → structured output → Google Sheets. Handled auth, multi-tenant isolation, and error recovery.',
          tags: ['Claude API', 'Python', 'Flask', 'React', 'ETL'],
        },
        {
          title: 'Client & Internal Applications',
          subtitle: 'DevPipeline · Multiple Production Apps',
          description:
            'Built production web applications for business clients — authentication, CRUD systems, third-party integrations, and workflow automation with a focus on reliability and maintainability.',
          tags: ['React', 'Python', 'PostgreSQL', 'Integrations'],
        },
        {
          title: 'This Portfolio',
          subtitle: 'React + Three.js',
          description:
            'Interactive 3D planet explorer — because resumes deserve better than a PDF.',
          tags: ['React', 'Three.js', 'R3F'],
        },
      ],
    },
  },
  {
    id: 'contact',
    name: 'Contact',
    tagline: 'Let\'s connect',
    color: '#f0c040',
    emissive: '#5c4a10',
    position: [8, -5, -3],
    size: 1.3,
    rotationSpeed: 0.14,
    content: {
      headline: 'Get In Touch',
      summary:
        'Based in Lehi, UT. Open to full-time roles, technical leadership opportunities, and interesting projects.',
      items: [
        {
          title: 'Email',
          description: 'tylermoline95@gmail.com',
        },
        {
          title: 'GitHub',
          description: 'github.com/TylerMoline66',
        },
        {
          title: 'LinkedIn',
          description: 'linkedin.com/in/tyler-moline-b30a2321b',
        },
        {
          title: 'Location',
          description: 'Lehi, Utah',
        },
        {
          title: 'Availability',
          description:
            'Open to full-time software engineering and technical lead roles — especially backend systems, integrations, and SaaS product work.',
        },
      ],
    },
  },
]

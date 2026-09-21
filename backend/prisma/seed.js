import { PrismaClient, ProjectStatus, Priority, TaskStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with Project-Scoped Roles...');

  // Clean existing records in reverse relational order
  await prisma.attachment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users (all are standard users, roles are project-level)
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const elena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const david = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.chen@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const amara = await prisma.user.create({
    data: {
      name: 'Amara Okafor',
      email: 'amara.okafor@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const lucas = await prisma.user.create({
    data: {
      name: 'Lucas Silva',
      email: 'lucas.silva@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    },
  });

  const zoe = await prisma.user.create({
    data: {
      name: 'Zoe Martinez',
      email: 'zoe.martinez@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  const liam = await prisma.user.create({
    data: {
      name: 'Liam Wright',
      email: 'liam.wright@pulseflow.io',
      password: passwordHash,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created 8 workspace users.');

  // 2. Create Projects (Creators are Managers)
  const now = new Date();
  const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Project 1: Created by Sarah (Manager: Sarah; Members: David, Amara, Lucas)
  const p1 = await prisma.project.create({
    data: {
      name: 'CloudScale NextGen Platform',
      description: 'Architecting high-throughput microservices and event-driven data streaming infrastructure.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.CRITICAL,
      color: '#6366f1',
      startDate: daysAgo(30),
      dueDate: daysFromNow(45),
      ownerId: sarah.id,
      members: {
        create: [
          { userId: sarah.id, role: 'MANAGER' },
          { userId: david.id, role: 'MEMBER' },
          { userId: amara.id, role: 'MEMBER' },
          { userId: lucas.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Project 2: Created by Marcus (Manager: Marcus; Members: Sarah, Zoe, Liam, David)
  const p2 = await prisma.project.create({
    data: {
      name: 'FinTech Mobile App Redesign',
      description: 'End-to-end design overhaul, biometric authorization, and real-time financial tracking widgets.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      color: '#0ea5e9',
      startDate: daysAgo(20),
      dueDate: daysFromNow(25),
      ownerId: marcus.id,
      members: {
        create: [
          { userId: marcus.id, role: 'MANAGER' },
          { userId: sarah.id, role: 'MEMBER' },
          { userId: zoe.id, role: 'MEMBER' },
          { userId: liam.id, role: 'MEMBER' },
          { userId: david.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Project 3: Created by Elena (Manager: Elena; Members: David, Amara, Zoe)
  const p3 = await prisma.project.create({
    data: {
      name: 'AI Analytics Engine v2.0',
      description: 'Machine learning forecasting pipeline, anomaly detection, and automated reporting dashboards.',
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      color: '#8b5cf6',
      startDate: daysAgo(10),
      dueDate: daysFromNow(60),
      ownerId: elena.id,
      members: {
        create: [
          { userId: elena.id, role: 'MANAGER' },
          { userId: david.id, role: 'MEMBER' },
          { userId: amara.id, role: 'MEMBER' },
          { userId: zoe.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Project 4: Created by Sarah (Manager: Sarah; Members: Marcus, Lucas, Liam)
  const p4 = await prisma.project.create({
    data: {
      name: 'Enterprise Security & SOC2 Compliance',
      description: 'Comprehensive audit trails, RBAC refinement, key rotation, and penetration test remediations.',
      status: ProjectStatus.PLANNING,
      priority: Priority.MEDIUM,
      color: '#10b981',
      startDate: daysAgo(5),
      dueDate: daysFromNow(90),
      ownerId: sarah.id,
      members: {
        create: [
          { userId: sarah.id, role: 'MANAGER' },
          { userId: marcus.id, role: 'MEMBER' },
          { userId: lucas.id, role: 'MEMBER' },
          { userId: liam.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Project 5: Created by David (Manager: David; Members: Sarah, Marcus, Amara)
  const p5 = await prisma.project.create({
    data: {
      name: 'Developer Tooling & CI/CD Pipeline',
      description: 'Automated preview environments, PR performance profiling, and test parallelization.',
      status: ProjectStatus.COMPLETED,
      priority: Priority.MEDIUM,
      color: '#f59e0b',
      startDate: daysAgo(60),
      dueDate: daysAgo(5),
      ownerId: david.id,
      members: {
        create: [
          { userId: david.id, role: 'MANAGER' },
          { userId: sarah.id, role: 'MEMBER' },
          { userId: marcus.id, role: 'MEMBER' },
          { userId: amara.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const projects = [p1, p2, p3, p4, p5];
  console.log('✅ Created 5 projects with creator managers and invited members.');

  // 3. Create Tasks
  const sampleTasks = [
    {
      title: 'Design Kafka event schemas for order pipelines',
      description: 'Specify Protobuf and Avro message schemas for guaranteed idempotency.',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      projectId: p1.id,
      assignedToId: david.id,
      createdById: sarah.id,
      startDate: daysAgo(25),
      dueDate: daysAgo(15),
      tags: ['Kafka', 'Backend'],
    },
    {
      title: 'Implement Redis distributed rate-limiter',
      description: 'Sliding window algorithm with Redis cluster fallback to prevent burst traffic spikes.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      projectId: p1.id,
      assignedToId: amara.id,
      createdById: sarah.id,
      startDate: daysAgo(10),
      dueDate: daysFromNow(3),
      tags: ['Redis', 'Performance'],
    },
    {
      title: 'Audit API latency and optimize SQL joins',
      description: 'Investigate p99 spikes on user transaction endpoints and add composite B-Tree indexes.',
      status: TaskStatus.REVIEW,
      priority: Priority.CRITICAL,
      projectId: p1.id,
      assignedToId: lucas.id,
      createdById: sarah.id,
      startDate: daysAgo(4),
      dueDate: daysFromNow(2),
      tags: ['Database', 'Postgres'],
    },
    {
      title: 'Chaos engineering drills on payment service',
      description: 'Simulate region network partitions and verify automated circuit breaker recovery.',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      projectId: p1.id,
      assignedToId: david.id,
      createdById: sarah.id,
      startDate: daysFromNow(2),
      dueDate: daysFromNow(12),
      tags: ['Chaos', 'Reliability'],
    },

    // FinTech Mobile App Redesign (Marcus is Manager)
    {
      title: 'Create Figma design system & component tokens',
      description: 'Standardize typography, semantic color variables, and button states.',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      projectId: p2.id,
      assignedToId: zoe.id,
      createdById: marcus.id,
      startDate: daysAgo(18),
      dueDate: daysAgo(8),
      tags: ['Design', 'UI'],
    },
    {
      title: 'Implement FaceID / Fingerprint biometric auth',
      description: 'Integrate native iOS Keychain and Android Keystore biometric verification.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      projectId: p2.id,
      assignedToId: david.id,
      createdById: marcus.id,
      startDate: daysAgo(6),
      dueDate: daysFromNow(4),
      tags: ['Security', 'Mobile'],
    },
    {
      title: 'Build interactive investment portfolio charts',
      description: 'Smooth SVG curves with tooltips and historical timeframes.',
      status: TaskStatus.REVIEW,
      priority: Priority.HIGH,
      projectId: p2.id,
      assignedToId: liam.id,
      createdById: marcus.id,
      startDate: daysAgo(5),
      dueDate: daysFromNow(1),
      tags: ['Frontend', 'Charts'],
    },

    // AI Analytics (Elena is Manager)
    {
      title: 'Benchmark LLM token latency and cost trade-offs',
      description: 'Evaluate Claude 3.5 Sonnet and GPT-4o for summarization response times.',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      projectId: p3.id,
      assignedToId: amara.id,
      createdById: elena.id,
      startDate: daysAgo(8),
      dueDate: daysAgo(2),
      tags: ['AI', 'Research'],
    },
    {
      title: 'Build Vector search embeddings indexing pipeline',
      description: 'Chunk enterprise documentation and generate 1536-dim embeddings stored in pgvector.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      projectId: p3.id,
      assignedToId: david.id,
      createdById: elena.id,
      startDate: daysAgo(3),
      dueDate: daysFromNow(6),
      tags: ['VectorDB', 'Embeddings'],
    },
  ];

  for (let i = 0; i < sampleTasks.length; i++) {
    const t = sampleTasks[i];
    await prisma.task.create({
      data: {
        ...t,
        order: i,
        estimatedHours: 16,
        actualHours: t.status === TaskStatus.COMPLETED ? 14 : 6,
      },
    });
  }

  console.log('✅ Created tasks across projects.');

  // 4. Create Notifications
  await prisma.notification.create({
    data: {
      userId: sarah.id,
      type: NotificationType.PROJECT_UPDATE,
      title: 'Welcome to PulseFlow',
      message: 'You are Manager for CloudScale NextGen Platform and Enterprise Security.',
    },
  });

  await prisma.notification.create({
    data: {
      userId: david.id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'Sarah Jenkins assigned you to "Design Kafka event schemas".',
      link: `/projects/${p1.id}`,
    },
  });

  console.log('\n=============================================');
  console.log('🎉 SEEDING COMPLETED (Project-Scoped Roles)!');
  console.log('=============================================');
  console.log('Password for all users: Password123!\n');
  console.log('Sample Users:');
  console.log('  Sarah Jenkins:  sarah.jenkins@pulseflow.io  (Manager of CloudScale & Security)');
  console.log('  Marcus Vance:   marcus.vance@pulseflow.io   (Manager of FinTech App)');
  console.log('  Elena Rostova:  elena.rostova@pulseflow.io  (Manager of AI Analytics)');
  console.log('  David Chen:     david.chen@pulseflow.io     (Manager of Developer Tooling, Member in others)');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import bcrypt from "bcryptjs";
import { PrismaClient, Role, MachineStatus, MaintenanceFrequency, AlertType, AlertStatus, WorkOrderStatus, WorkOrderCategory, WorkOrderPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding comprehensive university maintenance demo dataset...");

  // 1. Organization Profile
  await prisma.organizationProfile.upsert({
    where: { id: "primary" },
    update: {
      companyName: "University of Colombo - Faculty of Technology",
      address: "Pitipana, Homagama, Sri Lanka",
      registrationNumber: "UOC-FOT-2026",
      phone: "+94 11 275 8000",
      email: "technology@cmb.ac.lk"
    },
    create: {
      id: "primary",
      companyName: "University of Colombo - Faculty of Technology",
      address: "Pitipana, Homagama, Sri Lanka",
      registrationNumber: "UOC-FOT-2026",
      phone: "+94 11 275 8000",
      email: "technology@cmb.ac.lk"
    }
  });

  // 2. Demo Users
  const adminPass = await bcrypt.hash("Admin@12345", 10);
  const managerPass = await bcrypt.hash("Manager@12345", 10);
  const operatorPass = await bcrypt.hash("Operator@12345", 10);
  const providerPass = await bcrypt.hash("Provider@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminPass, name: "System Administrator", role: Role.ADMIN, isActive: true },
    create: { name: "System Administrator", email: "admin@example.com", passwordHash: adminPass, role: Role.ADMIN }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@example.com" },
    update: { passwordHash: managerPass, name: "Dr. K. Jayasuriya (Lab Manager)", role: Role.MANAGER, isActive: true },
    create: { name: "Dr. K. Jayasuriya (Lab Manager)", email: "manager@example.com", passwordHash: managerPass, role: Role.MANAGER }
  });

  const operator = await prisma.user.upsert({
    where: { email: "operator@example.com" },
    update: { passwordHash: operatorPass, name: "Methum Jayawardhane (Machine Operator)", role: Role.MACHINE_OPERATOR, isActive: true },
    create: { name: "Methum Jayawardhane (Machine Operator)", email: "operator@example.com", passwordHash: operatorPass, role: Role.MACHINE_OPERATOR }
  });

  const provider = await prisma.user.upsert({
    where: { email: "provider@example.com" },
    update: { passwordHash: providerPass, name: "Precision Industrial Engineering Ltd", role: Role.SERVICE_PROVIDER, isActive: true },
    create: { name: "Precision Industrial Engineering Ltd", email: "provider@example.com", passwordHash: providerPass, role: Role.SERVICE_PROVIDER }
  });

  console.log("Users seeded successfully.");

  // Clean old machines/parts/plans/alerts to allow clean idempotent re-seed
  await prisma.workOrderReplacement.deleteMany();
  await prisma.workOrderPriceCounter.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.maintenancePlan.deleteMany();
  await prisma.machinePart.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.auditLog.deleteMany();

  // 3. Machines
  const now = new Date();
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const yearAhead = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const daysAhead30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const daysAgo5 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  const m1 = await prisma.machine.create({
    data: {
      assetCode: "UOC-FOT-CNC-01",
      name: "Haas VF-2 3-Axis CNC Vertical Machining Center",
      category: "CNC Machining",
      location: "Workshop Lab 102",
      manufacturer: "Haas Automation",
      model: "VF-2SS",
      serialNumber: "HAAS-2024-9843",
      warrantyStart: yearAgo,
      warrantyEnd: yearAhead,
      status: MachineStatus.ACTIVE,
      operatorId: operator.id
    }
  });

  const m2 = await prisma.machine.create({
    data: {
      assetCode: "UOC-FOT-3DP-02",
      name: "UltiMaker S5 Dual Extrusion 3D Printer",
      category: "Additive Manufacturing",
      location: "Prototyping Studio 204",
      manufacturer: "UltiMaker",
      model: "S5-Pro",
      serialNumber: "UM-S5-88319",
      warrantyStart: yearAgo,
      warrantyEnd: daysAhead30,
      status: MachineStatus.UNDER_MAINTENANCE,
      operatorId: operator.id
    }
  });

  const m3 = await prisma.machine.create({
    data: {
      assetCode: "UOC-FOT-LSR-03",
      name: "Epilog Fusion Pro 48 CO2 Laser Cutter",
      category: "Laser Processing",
      location: "Fabrication Lab 105",
      manufacturer: "Epilog Laser",
      model: "Fusion Pro 48",
      serialNumber: "EPI-F48-3341",
      warrantyStart: yearAgo,
      warrantyEnd: yearAhead,
      status: MachineStatus.ACTIVE,
      operatorId: operator.id
    }
  });

  const m4 = await prisma.machine.create({
    data: {
      assetCode: "UOC-FOT-HYD-04",
      name: "Shimadzu UH-500kNX Universal Testing Machine",
      category: "Material Testing",
      location: "Civil & Materials Lab 108",
      manufacturer: "Shimadzu",
      model: "UH-F500kNX",
      serialNumber: "SHIM-UH-500-12",
      warrantyStart: yearAgo,
      warrantyEnd: yearAhead,
      status: MachineStatus.ACTIVE,
      operatorId: operator.id
    }
  });

  console.log("Machines seeded successfully.");

  // 4. Machine Parts
  const p1 = await prisma.machinePart.create({
    data: {
      machineId: m1.id,
      name: "Ceramic Spindle High-Speed Bearings",
      partNumber: "HAAS-BRG-7014",
      warrantyStart: yearAgo,
      warrantyEnd: yearAhead,
      replacementDue: daysAhead30,
      quantity: 4
    }
  });

  const p2 = await prisma.machinePart.create({
    data: {
      machineId: m1.id,
      name: "X-Axis Drive Timing Belt (HTD 8M)",
      partNumber: "BLT-8M-1200",
      warrantyStart: yearAgo,
      warrantyEnd: daysAgo5,
      replacementDue: daysAgo5,
      quantity: 2
    }
  });

  const p3 = await prisma.machinePart.create({
    data: {
      machineId: m2.id,
      name: "AA 0.4mm Print Core Extrusion Nozzle",
      partNumber: "UM-CORE-AA04",
      warrantyStart: yearAgo,
      warrantyEnd: daysAhead30,
      replacementDue: daysAhead30,
      quantity: 3
    }
  });

  const p4 = await prisma.machinePart.create({
    data: {
      machineId: m3.id,
      name: "120W Sealed CO2 Laser Source Tube",
      partNumber: "EPI-CO2-120W",
      warrantyStart: yearAgo,
      warrantyEnd: yearAhead,
      replacementDue: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      quantity: 1
    }
  });

  console.log("Machine parts seeded successfully.");

  // 5. Maintenance Plans
  const plan1 = await prisma.maintenancePlan.create({
    data: {
      machineId: m1.id,
      title: "Monthly Spindle & Way-Lube System Inspection",
      description: "Inspect hydraulic coolant concentration, pneumatic pressure, and automatic way-lube reservoir.",
      frequency: MaintenanceFrequency.MONTHLY,
      intervalDays: 30,
      nextDueDate: daysAhead30,
      thresholdDays: 7,
      isActive: true
    }
  });

  const plan2 = await prisma.maintenancePlan.create({
    data: {
      machineId: m2.id,
      title: "Bi-Weekly Print Bed Leveling & Feeder Calibration",
      description: "Clean dual-extrusion gears, check Bowden tube play, and verify capacitive sensor calibration.",
      frequency: MaintenanceFrequency.WEEKLY,
      intervalDays: 14,
      nextDueDate: daysAgo5,
      thresholdDays: 3,
      isActive: true
    }
  });

  const plan3 = await prisma.maintenancePlan.create({
    data: {
      machineId: m3.id,
      title: "Quarterly Mirror Optics Alignment & Chiller De-ionizing",
      description: "Clean reflective mirrors #1, #2, #3 with optical lens wipes and replace chiller distilled coolant.",
      frequency: MaintenanceFrequency.QUARTERLY,
      intervalDays: 90,
      nextDueDate: daysAhead30,
      thresholdDays: 10,
      isActive: true
    }
  });

  console.log("Maintenance plans seeded successfully.");

  // 6. Alerts
  await prisma.alert.create({
    data: {
      machineId: m2.id,
      planId: plan2.id,
      type: AlertType.MAINTENANCE_DUE,
      status: AlertStatus.OPEN,
      dueDate: daysAgo5,
      message: "Bi-Weekly Print Bed Leveling & Feeder Calibration is 5 days past due date on UltiMaker S5.",
      dedupeKey: `plan-${plan2.id}-${daysAgo5.toISOString()}`
    }
  });

  await prisma.alert.create({
    data: {
      machineId: m1.id,
      partId: p2.id,
      type: AlertType.PART_REPLACEMENT,
      status: AlertStatus.OPEN,
      dueDate: daysAgo5,
      message: "Drive belt on Haas VF-2 has reached scheduled service life (replacement due: 5 days ago).",
      dedupeKey: `part-${p2.id}-${daysAgo5.toISOString()}`
    }
  });

  await prisma.alert.create({
    data: {
      machineId: m3.id,
      planId: plan3.id,
      type: AlertType.MAINTENANCE_DUE,
      status: AlertStatus.RESOLVED,
      dueDate: daysAhead30,
      message: "Quarterly optics alignment performed satisfactorily. Mirrors calibrated to 99.4% beam efficiency.",
      dedupeKey: `plan-${plan3.id}-${daysAhead30.toISOString()}`,
      resolvedAt: new Date()
    }
  });

  console.log("Alerts seeded successfully.");

  // 7. Work Orders
  const woClosed = await prisma.workOrder.create({
    data: {
      machineId: m1.id,
      providerId: provider.id,
      createdById: operator.id,
      approvedByOperatorId: operator.id,
      managementApprovedById: manager.id,
      paymentApprovedById: manager.id,
      title: "Emergency Way-Lube Pump Seal Replacement & System Bleed",
      description: "Way-lube pressure dropped below 2.5 bar trigger during 5-axis indexing. Lubrication pump seal replaced.",
      category: WorkOrderCategory.BREAKDOWN_REPAIR,
      priority: WorkOrderPriority.HIGH,
      status: WorkOrderStatus.CLOSED,
      scheduledDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      providerAcceptedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      completionSubmittedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      completedDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      managementApprovedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      paymentApprovedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      paymentReference: "PAY-2026-0042",
      invoiceNumber: "INV-PIE-2026-109",
      providerBusinessName: "Precision Industrial Engineering Ltd",
      providerAddress: "No. 45 Temple Road, Nugegoda, Sri Lanka",
      providerRegistrationNumber: "PV-88310",
      providerContact: "+94 11 282 4400",
      proposedBudget: 35000.00,
      serviceCost: 15000.00,
      notes: "Pump rebuilt with Viton chemical-resistant seals. Successfully pressure tested to 4.2 bar."
    }
  });

  await prisma.workOrderReplacement.create({
    data: {
      workOrderId: woClosed.id,
      machinePartId: p1.id,
      partName: "Viton High-Pressure Pump O-Ring Seal Kit",
      partNumber: "VTN-SEAL-420",
      quantity: 2,
      unitCost: 10000.00,
      warrantyStart: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      warrantyEnd: new Date(now.getTime() + 357 * 24 * 60 * 60 * 1000),
      nextReplacementDate: new Date(now.getTime() + 300 * 24 * 60 * 60 * 1000),
      notes: "Installed with OEM silicone grease."
    }
  });

  const woInProgress = await prisma.workOrder.create({
    data: {
      machineId: m2.id,
      providerId: provider.id,
      createdById: operator.id,
      approvedByOperatorId: operator.id,
      managementApprovedById: manager.id,
      title: "Extruder Feeder Stepper Motor & Thermal Coupler Overhaul",
      description: "Dual extrusion temperature sensor intermittent tripping during long ABS filament prints.",
      category: WorkOrderCategory.PART_REPLACEMENT,
      priority: WorkOrderPriority.NORMAL,
      status: WorkOrderStatus.IN_PROGRESS,
      scheduledDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      providerAcceptedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      proposedBudget: 22500.00,
      serviceCost: 7500.00,
      providerBusinessName: "Precision Industrial Engineering Ltd",
      providerContact: "+94 11 282 4400",
      notes: "Technician on site inspecting thermocouple wiring harness."
    }
  });

  const woPending = await prisma.workOrder.create({
    data: {
      machineId: m3.id,
      createdById: operator.id,
      title: "Annual Exhaust Blower Motor Balancing & HEPA Filter Replacement",
      description: "Annual preventive inspection of fume extraction and particulate filtration system.",
      category: WorkOrderCategory.PREVENTIVE_MAINTENANCE,
      priority: WorkOrderPriority.NORMAL,
      status: WorkOrderStatus.PENDING_MANAGEMENT_APPROVAL,
      scheduledDate: daysAhead30,
      proposedBudget: 18000.00,
      notes: "Submitted for faculty approval before external vendor dispatch."
    }
  });

  console.log("Work orders seeded successfully.");

  // 8. Audit Logs
  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "INITIAL_SEED",
      entityType: "ORGANIZATION",
      entityId: "primary",
      details: { message: "System initialized with University of Colombo Faculty of Technology demo dataset." }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: operator.id,
      action: "CREATE_WORK_ORDER",
      entityType: "WORK_ORDER",
      entityId: woClosed.id,
      details: { title: woClosed.title, priority: woClosed.priority }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: manager.id,
      action: "APPROVE_PAYMENT",
      entityType: "WORK_ORDER",
      entityId: woClosed.id,
      details: { paymentReference: "PAY-2026-0042", amount: 35000.00 }
    }
  });

  console.log("Audit logs seeded successfully.");
  console.log("=== FULL DEMO SEED COMPLETED SUCCESSFULLY ===");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

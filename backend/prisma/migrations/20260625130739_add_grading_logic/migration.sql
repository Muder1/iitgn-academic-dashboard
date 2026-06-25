-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "discipline" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "basket" TEXT NOT NULL,
    "branch" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumRequirement" (
    "id" SERIAL NOT NULL,
    "admissionYear" INTEGER NOT NULL,
    "discipline" TEXT NOT NULL,
    "basketName" TEXT NOT NULL,
    "requiredCredits" INTEGER NOT NULL,

    CONSTRAINT "CurriculumRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBasket" (
    "id" SERIAL NOT NULL,
    "courseId" TEXT NOT NULL,
    "basketName" TEXT NOT NULL,

    CONSTRAINT "CourseBasket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicRecord" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "grade" TEXT,
    "status" TEXT NOT NULL,
    "isHonors" BOOLEAN NOT NULL DEFAULT false,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "isGraded" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AcademicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumRequirement_admissionYear_discipline_basketName_key" ON "CurriculumRequirement"("admissionYear", "discipline", "basketName");

-- CreateIndex
CREATE UNIQUE INDEX "CourseBasket_courseId_basketName_key" ON "CourseBasket"("courseId", "basketName");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicRecord_userId_courseId_key" ON "AcademicRecord"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseBasket" ADD CONSTRAINT "CourseBasket_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

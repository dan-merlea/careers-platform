# TypeORM to Mongoose Migration Documentation

This document outlines the process and changes made to migrate the Careers platform from TypeORM to Mongoose for MongoDB interactions.

## Migration Overview

The migration involved converting TypeORM entities to Mongoose schemas, updating services to use Mongoose models instead of TypeORM repositories, and fixing TypeScript and ESLint issues that arose during the migration.

## Key Changes

### Schema Definitions
- Replaced TypeORM `@Entity()`, `@Column()`, and `@ManyToOne()` decorators with Mongoose `@Schema()` and `@Prop()` decorators
- Added `timestamps: true` to schemas to automatically manage `createdAt` and `updatedAt` fields
- Converted UUID primary keys to MongoDB ObjectId
- Changed relationship handling from TypeORM relations to Mongoose references using `MongooseSchema.Types.ObjectId`

### Module Configuration
- Replaced TypeORM module imports and configuration with Mongoose equivalents:
  ```typescript
  // Before (TypeORM)
  TypeOrmModule.forFeature([Job, Company, Department, Office])
  
  // After (Mongoose)
  MongooseModule.forFeature([
    { name: Job.name, schema: JobSchema },
    { name: Company.name, schema: CompanySchema },
    { name: Department.name, schema: DepartmentSchema },
    { name: Office.name, schema: OfficeSchema },
  ])
  ```

### Service Layer Changes
- Updated service methods to use Mongoose Model methods instead of TypeORM Repository methods
- Changed query patterns:
  ```typescript
  // Before (TypeORM)
  this.jobRepository.findOne({ where: { id } });
  
  // After (Mongoose)
  this.jobModel.findById(id).exec();
  ```
- Updated population of related entities:
  ```typescript
  // Before (TypeORM - automatic relations)
  this.jobRepository.findOne({ where: { id }, relations: ['company', 'departments', 'offices'] });
  
  // After (Mongoose - explicit population)
  this.jobModel.findById(id)
    .populate('company')
    .populate('departments')
    .populate('offices')
    .exec();
  ```

### TypeScript and Type Safety
- Added explicit type definitions for Mongoose documents using interfaces like `JobDocument`
- Used type assertions to handle ObjectId vs populated document type issues
- Added null checks and safe access for populated fields
- Used explicit casting where necessary to satisfy TypeScript's strict type checking

### Controller Layer Changes
- Updated DTO mapping functions to handle Mongoose document structures
- Added safe navigation for populated fields
- Converted ObjectId to string for API responses

## Challenges and Solutions

### Challenge: TypeScript Errors with ObjectId References
**Problem**: TypeScript errors when accessing populated fields due to type mismatch between ObjectId reference and populated document.

**Solution**: Used type assertions and explicit casting to handle these cases:
```typescript
// Cast to any to avoid TypeScript errors with ObjectId vs Company
(job as any).company = company._id;
```

### Challenge: ESLint Formatting Issues
**Problem**: ESLint errors related to formatting, especially with map functions and indentation.

**Solution**: Restructured code to follow ESLint rules, particularly for array mapping functions:
```typescript
departments: job.departments?.map((dept: any) => (
  {
    id: dept._id ? dept._id.toString() : '',
    name: dept.title || '',
  }
)) || [],
```

### Challenge: Schema Field Name Changes
**Problem**: Some field names changed between TypeORM entities and Mongoose schemas (e.g., `name` to `title` in Department).

**Solution**: Updated mapping functions to use the correct field names and added comments to document these changes:
```typescript
name: dept.title || '', // Changed from name to title based on department schema
```

## Testing and Verification

The migration was verified by:
1. Successfully building the application with `npm run build`
2. Ensuring all TypeScript and ESLint errors were resolved
3. Testing CRUD operations to confirm proper functionality

## Future Considerations

- Consider adding more robust validation using Mongoose schema validation
- Implement more comprehensive error handling for Mongoose operations
- Review and update frontend components to ensure compatibility with Mongoose document structures
- Consider adding Mongoose middleware for common operations

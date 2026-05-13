import { DataSource } from 'typeorm';
import { User, Student, Parent, Teacher, Admin, Class } from './src/entities';
const dataSource = new DataSource({
  type: 'postgres',
  entities: [User, Student, Parent, Teacher, Admin, Class],
});
// @ts-ignore
dataSource.buildMetadatas();
const md = dataSource.getMetadata(User);
console.log("User UQs:", md.uniques.map(u => u.name + " -> " + u.columns.map(c => c.propertyName)));

const smd = dataSource.getMetadata(Student);
console.log("Student UQs:", smd.uniques.map(u => u.name + " -> " + u.columns.map(c => c.propertyName)));

const pmd = dataSource.getMetadata(Parent);
console.log("Parent UQs:", pmd.uniques.map(u => u.name + " -> " + u.columns.map(c => c.propertyName)));
console.log("Parent relations:", pmd.relations.filter(r => r.isOneToOne).map(r => r.propertyName + " " + r.joinColumns.map(j => j.propertyName)));


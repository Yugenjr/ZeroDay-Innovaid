import React, { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  studentId?: string;
  department?: string;
  year?: number;
  phone?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  department: string;
  category: string;
  publisher: string;
  year: number;
  edition: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  location: string;
  tags: string[];
}

interface StudentLibraryProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  isDarkMode: boolean;
}

const StudentLibrary: React.FC<StudentLibraryProps> = ({ user, onBack, onLogout, isDarkMode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  // Mock engineering books data
  const mockBooks: Book[] = [
    // Computer Science & Engineering
    { id: '1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', department: 'Computer Science', category: 'Algorithms', publisher: 'MIT Press', year: 2009, edition: '3rd', totalCopies: 5, availableCopies: 2, description: 'Comprehensive introduction to algorithms and data structures', location: 'CS Section - Shelf A1', tags: ['algorithms', 'data structures', 'programming'] },
    { id: '2', title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', department: 'Computer Science', category: 'Software Engineering', publisher: 'Prentice Hall', year: 2008, edition: '1st', totalCopies: 4, availableCopies: 1, description: 'A handbook of agile software craftsmanship', location: 'CS Section - Shelf A2', tags: ['clean code', 'software engineering', 'best practices'] },
    { id: '3', title: 'Computer Networks', author: 'Andrew S. Tanenbaum', isbn: '978-0132126953', department: 'Computer Science', category: 'Networks', publisher: 'Pearson', year: 2010, edition: '5th', totalCopies: 6, availableCopies: 3, description: 'Comprehensive guide to computer networking', location: 'CS Section - Shelf B1', tags: ['networking', 'protocols', 'internet'] },
    { id: '4', title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0073523323', department: 'Computer Science', category: 'Database', publisher: 'McGraw-Hill', year: 2019, edition: '7th', totalCopies: 5, availableCopies: 4, description: 'Fundamental concepts of database systems', location: 'CS Section - Shelf B2', tags: ['database', 'sql', 'data management'] },
    { id: '5', title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', department: 'Computer Science', category: 'Operating Systems', publisher: 'Wiley', year: 2018, edition: '10th', totalCopies: 7, availableCopies: 0, description: 'Comprehensive guide to operating systems', location: 'CS Section - Shelf C1', tags: ['operating systems', 'processes', 'memory management'] },

    // Electrical & Electronics Engineering
    { id: '6', title: 'Fundamentals of Electric Circuits', author: 'Charles K. Alexander', isbn: '978-0073380575', department: 'Electrical Engineering', category: 'Circuit Analysis', publisher: 'McGraw-Hill', year: 2016, edition: '6th', totalCopies: 8, availableCopies: 5, description: 'Basic principles of electric circuit analysis', location: 'EE Section - Shelf A1', tags: ['circuits', 'electrical', 'analysis'] },
    { id: '7', title: 'Electronic Devices and Circuit Theory', author: 'Robert L. Boylestad', isbn: '978-0132622264', department: 'Electrical Engineering', category: 'Electronics', publisher: 'Pearson', year: 2012, edition: '11th', totalCopies: 6, availableCopies: 2, description: 'Comprehensive coverage of electronic devices', location: 'EE Section - Shelf A2', tags: ['electronics', 'devices', 'semiconductors'] },
    { id: '8', title: 'Power System Analysis', author: 'John J. Grainger', isbn: '978-0070612938', department: 'Electrical Engineering', category: 'Power Systems', publisher: 'McGraw-Hill', year: 1994, edition: '1st', totalCopies: 4, availableCopies: 1, description: 'Analysis of electrical power systems', location: 'EE Section - Shelf B1', tags: ['power systems', 'electrical power', 'grid'] },
    { id: '9', title: 'Control Systems Engineering', author: 'Norman S. Nise', isbn: '978-1118170519', department: 'Electrical Engineering', category: 'Control Systems', publisher: 'Wiley', year: 2015, edition: '7th', totalCopies: 5, availableCopies: 3, description: 'Modern control systems design and analysis', location: 'EE Section - Shelf B2', tags: ['control systems', 'automation', 'feedback'] },
    { id: '10', title: 'Digital Signal Processing', author: 'John G. Proakis', isbn: '978-0131873742', department: 'Electrical Engineering', category: 'Signal Processing', publisher: 'Pearson', year: 2006, edition: '4th', totalCopies: 3, availableCopies: 0, description: 'Principles and applications of DSP', location: 'EE Section - Shelf C1', tags: ['signal processing', 'digital', 'filters'] },

    // Mechanical Engineering
    { id: '11', title: 'Engineering Mechanics: Statics', author: 'Russell C. Hibbeler', isbn: '978-0134814971', department: 'Mechanical Engineering', category: 'Mechanics', publisher: 'Pearson', year: 2015, edition: '14th', totalCopies: 10, availableCopies: 7, description: 'Fundamental principles of engineering statics', location: 'ME Section - Shelf A1', tags: ['statics', 'mechanics', 'forces'] },
    { id: '12', title: 'Thermodynamics: An Engineering Approach', author: 'Yunus A. Cengel', isbn: '978-0073398174', department: 'Mechanical Engineering', category: 'Thermodynamics', publisher: 'McGraw-Hill', year: 2014, edition: '8th', totalCopies: 8, availableCopies: 4, description: 'Comprehensive thermodynamics for engineers', location: 'ME Section - Shelf A2', tags: ['thermodynamics', 'heat transfer', 'energy'] },
    { id: '13', title: 'Machine Design', author: 'Robert L. Norton', isbn: '978-0133356717', department: 'Mechanical Engineering', category: 'Design', publisher: 'Pearson', year: 2013, edition: '5th', totalCopies: 6, availableCopies: 2, description: 'Integrated approach to machine design', location: 'ME Section - Shelf B1', tags: ['machine design', 'mechanical design', 'engineering'] },
    { id: '14', title: 'Fluid Mechanics', author: 'Frank M. White', isbn: '978-0073398273', department: 'Mechanical Engineering', category: 'Fluid Mechanics', publisher: 'McGraw-Hill', year: 2015, edition: '8th', totalCopies: 7, availableCopies: 5, description: 'Fundamentals of fluid mechanics', location: 'ME Section - Shelf B2', tags: ['fluid mechanics', 'flow', 'hydraulics'] },
    { id: '15', title: 'Manufacturing Processes', author: 'Serope Kalpakjian', isbn: '978-0134290553', department: 'Mechanical Engineering', category: 'Manufacturing', publisher: 'Pearson', year: 2016, edition: '7th', totalCopies: 5, availableCopies: 1, description: 'Comprehensive guide to manufacturing processes', location: 'ME Section - Shelf C1', tags: ['manufacturing', 'production', 'processes'] },

    // Civil Engineering
    { id: '16', title: 'Structural Analysis', author: 'Russell C. Hibbeler', isbn: '978-0134610672', department: 'Civil Engineering', category: 'Structural Engineering', publisher: 'Pearson', year: 2017, edition: '10th', totalCopies: 9, availableCopies: 6, description: 'Fundamental principles of structural analysis', location: 'CE Section - Shelf A1', tags: ['structural analysis', 'civil engineering', 'structures'] },
    { id: '17', title: 'Reinforced Concrete Design', author: 'William T. Segui', isbn: '978-1111317423', department: 'Civil Engineering', category: 'Concrete Design', publisher: 'Cengage Learning', year: 2012, edition: '1st', totalCopies: 6, availableCopies: 3, description: 'Design of reinforced concrete structures', location: 'CE Section - Shelf A2', tags: ['concrete', 'reinforced concrete', 'design'] },
    { id: '18', title: 'Geotechnical Engineering', author: 'Braja M. Das', isbn: '978-1305635180', department: 'Civil Engineering', category: 'Geotechnical', publisher: 'Cengage Learning', year: 2015, edition: '8th', totalCopies: 4, availableCopies: 2, description: 'Principles and practices of geotechnical engineering', location: 'CE Section - Shelf B1', tags: ['geotechnical', 'soil mechanics', 'foundations'] },
    { id: '19', title: 'Transportation Engineering', author: 'C. Jotin Khisty', isbn: '978-0132719261', department: 'Civil Engineering', category: 'Transportation', publisher: 'Pearson', year: 2012, edition: '4th', totalCopies: 5, availableCopies: 4, description: 'Planning, design, and operations of transportation systems', location: 'CE Section - Shelf B2', tags: ['transportation', 'traffic', 'highways'] },
    { id: '20', title: 'Environmental Engineering', author: 'Howard S. Peavy', isbn: '978-0070494909', department: 'Civil Engineering', category: 'Environmental', publisher: 'McGraw-Hill', year: 1985, edition: '1st', totalCopies: 3, availableCopies: 0, description: 'Environmental engineering principles and practice', location: 'CE Section - Shelf C1', tags: ['environmental', 'water treatment', 'pollution'] },

    // Electronics & Communication Engineering
    { id: '21', title: 'Communication Systems', author: 'Simon Haykin', isbn: '978-0471697909', department: 'Electronics & Communication', category: 'Communication', publisher: 'Wiley', year: 2000, edition: '4th', totalCopies: 7, availableCopies: 3, description: 'Analog and digital communication systems', location: 'ECE Section - Shelf A1', tags: ['communication', 'analog', 'digital'] },
    { id: '22', title: 'Microprocessors and Microcontrollers', author: 'Krishna Kant', isbn: '978-8120336797', department: 'Electronics & Communication', category: 'Microprocessors', publisher: 'PHI Learning', year: 2007, edition: '1st', totalCopies: 8, availableCopies: 5, description: 'Architecture and programming of microprocessors', location: 'ECE Section - Shelf A2', tags: ['microprocessors', 'microcontrollers', 'embedded'] },
    { id: '23', title: 'Antenna Theory and Design', author: 'Warren L. Stutzman', isbn: '978-0470576649', department: 'Electronics & Communication', category: 'Antennas', publisher: 'Wiley', year: 2012, edition: '3rd', totalCopies: 4, availableCopies: 1, description: 'Analysis and design of antenna systems', location: 'ECE Section - Shelf B1', tags: ['antennas', 'electromagnetic', 'wireless'] },
    { id: '24', title: 'VLSI Design', author: 'Neil H.E. Weste', isbn: '978-0321547743', department: 'Electronics & Communication', category: 'VLSI', publisher: 'Pearson', year: 2010, edition: '4th', totalCopies: 5, availableCopies: 2, description: 'CMOS VLSI design methodology', location: 'ECE Section - Shelf B2', tags: ['vlsi', 'cmos', 'integrated circuits'] },
    { id: '25', title: 'Electromagnetic Field Theory', author: 'Guru & Hiziroglu', isbn: '978-0534955489', department: 'Electronics & Communication', category: 'Electromagnetics', publisher: 'Cambridge University Press', year: 2004, edition: '3rd', totalCopies: 6, availableCopies: 4, description: 'Fundamentals of electromagnetic field theory', location: 'ECE Section - Shelf C1', tags: ['electromagnetics', 'fields', 'waves'] }
  ];

  // Additional books to reach 50
  const additionalBooks: Book[] = [
    // More Computer Science books
    { id: '26', title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633612', department: 'Computer Science', category: 'Software Engineering', publisher: 'Addison-Wesley', year: 1994, edition: '1st', totalCopies: 3, availableCopies: 1, description: 'Elements of reusable object-oriented software', location: 'CS Section - Shelf C2', tags: ['design patterns', 'oop', 'software architecture'] },
    { id: '27', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', isbn: '978-0136042594', department: 'Computer Science', category: 'Artificial Intelligence', publisher: 'Pearson', year: 2020, edition: '4th', totalCopies: 4, availableCopies: 2, description: 'Comprehensive introduction to AI', location: 'CS Section - Shelf D1', tags: ['ai', 'machine learning', 'intelligent systems'] },
    { id: '28', title: 'Computer Graphics: Principles and Practice', author: 'John F. Hughes', isbn: '978-0321399526', department: 'Computer Science', category: 'Computer Graphics', publisher: 'Addison-Wesley', year: 2013, edition: '3rd', totalCopies: 2, availableCopies: 0, description: 'Comprehensive guide to computer graphics', location: 'CS Section - Shelf D2', tags: ['graphics', 'rendering', 'visualization'] },
    { id: '29', title: 'Compilers: Principles, Techniques, and Tools', author: 'Alfred V. Aho', isbn: '978-0321486813', department: 'Computer Science', category: 'Compilers', publisher: 'Pearson', year: 2006, edition: '2nd', totalCopies: 3, availableCopies: 1, description: 'The Dragon Book - compiler design', location: 'CS Section - Shelf E1', tags: ['compilers', 'programming languages', 'parsing'] },
    { id: '30', title: 'Software Engineering', author: 'Ian Sommerville', isbn: '978-0133943030', department: 'Computer Science', category: 'Software Engineering', publisher: 'Pearson', year: 2015, edition: '10th', totalCopies: 5, availableCopies: 3, description: 'Comprehensive software engineering textbook', location: 'CS Section - Shelf E2', tags: ['software engineering', 'development', 'project management'] },

    // More Electrical Engineering books
    { id: '31', title: 'Electric Machinery Fundamentals', author: 'Stephen J. Chapman', isbn: '978-0073529547', department: 'Electrical Engineering', category: 'Electric Machines', publisher: 'McGraw-Hill', year: 2011, edition: '5th', totalCopies: 6, availableCopies: 4, description: 'Fundamentals of electric machinery and transformers', location: 'EE Section - Shelf C2', tags: ['electric machines', 'motors', 'transformers'] },
    { id: '32', title: 'Microelectronic Circuits', author: 'Adel S. Sedra', isbn: '978-0199339136', department: 'Electrical Engineering', category: 'Microelectronics', publisher: 'Oxford University Press', year: 2014, edition: '7th', totalCopies: 7, availableCopies: 2, description: 'Analysis and design of microelectronic circuits', location: 'EE Section - Shelf D1', tags: ['microelectronics', 'analog circuits', 'amplifiers'] },
    { id: '33', title: 'Renewable Energy Systems', author: 'Mukund R. Patel', isbn: '978-1439856291', department: 'Electrical Engineering', category: 'Renewable Energy', publisher: 'CRC Press', year: 2011, edition: '2nd', totalCopies: 4, availableCopies: 1, description: 'Design and analysis of renewable energy systems', location: 'EE Section - Shelf D2', tags: ['renewable energy', 'solar', 'wind power'] },

    // More Mechanical Engineering books
    { id: '34', title: 'Heat and Mass Transfer', author: 'Yunus A. Cengel', isbn: '978-0073398181', department: 'Mechanical Engineering', category: 'Heat Transfer', publisher: 'McGraw-Hill', year: 2014, edition: '5th', totalCopies: 8, availableCopies: 5, description: 'Fundamentals of heat and mass transfer', location: 'ME Section - Shelf C2', tags: ['heat transfer', 'mass transfer', 'thermal'] },
    { id: '35', title: 'Mechanics of Materials', author: 'Russell C. Hibbeler', isbn: '978-0134319650', department: 'Mechanical Engineering', category: 'Materials', publisher: 'Pearson', year: 2016, edition: '10th', totalCopies: 9, availableCopies: 6, description: 'Stress, strain, and deformation of materials', location: 'ME Section - Shelf D1', tags: ['materials', 'stress', 'strain'] },
    { id: '36', title: 'Internal Combustion Engines', author: 'John B. Heywood', isbn: '978-0070286375', department: 'Mechanical Engineering', category: 'Engines', publisher: 'McGraw-Hill', year: 1988, edition: '1st', totalCopies: 3, availableCopies: 0, description: 'Fundamentals of internal combustion engines', location: 'ME Section - Shelf D2', tags: ['engines', 'combustion', 'automotive'] },

    // More Civil Engineering books
    { id: '37', title: 'Steel Design', author: 'William T. Segui', isbn: '978-1111576004', department: 'Civil Engineering', category: 'Steel Design', publisher: 'Cengage Learning', year: 2012, edition: '5th', totalCopies: 5, availableCopies: 3, description: 'Design of steel structures and connections', location: 'CE Section - Shelf C2', tags: ['steel design', 'structures', 'connections'] },
    { id: '38', title: 'Water Resources Engineering', author: 'Larry W. Mays', isbn: '978-0470460641', department: 'Civil Engineering', category: 'Water Resources', publisher: 'Wiley', year: 2010, edition: '2nd', totalCopies: 4, availableCopies: 2, description: 'Planning and management of water resources', location: 'CE Section - Shelf D1', tags: ['water resources', 'hydrology', 'hydraulics'] },
    { id: '39', title: 'Construction Management', author: 'Daniel W. Halpin', isbn: '978-0470447239', department: 'Civil Engineering', category: 'Construction', publisher: 'Wiley', year: 2010, edition: '4th', totalCopies: 6, availableCopies: 4, description: 'Principles of construction project management', location: 'CE Section - Shelf D2', tags: ['construction', 'project management', 'planning'] },

    // More Electronics & Communication books
    { id: '40', title: 'Digital Communications', author: 'John G. Proakis', isbn: '978-0072957167', department: 'Electronics & Communication', category: 'Digital Communication', publisher: 'McGraw-Hill', year: 2007, edition: '5th', totalCopies: 6, availableCopies: 3, description: 'Principles of digital communication systems', location: 'ECE Section - Shelf C2', tags: ['digital communication', 'modulation', 'coding'] },
    { id: '41', title: 'Radar Systems Analysis and Design', author: 'Bassem R. Mahafza', isbn: '978-1584885320', department: 'Electronics & Communication', category: 'Radar', publisher: 'Chapman & Hall', year: 2005, edition: '2nd', totalCopies: 3, availableCopies: 1, description: 'Analysis and design of radar systems', location: 'ECE Section - Shelf D1', tags: ['radar', 'signal processing', 'detection'] },
    { id: '42', title: 'Optical Fiber Communications', author: 'Gerd Keiser', isbn: '978-0073380711', department: 'Electronics & Communication', category: 'Optical Communication', publisher: 'McGraw-Hill', year: 2010, edition: '4th', totalCopies: 4, availableCopies: 2, description: 'Principles of optical fiber communication', location: 'ECE Section - Shelf D2', tags: ['optical communication', 'fiber optics', 'photonics'] },

    // Additional interdisciplinary books
    { id: '43', title: 'Engineering Mathematics', author: 'K.A. Stroud', isbn: '978-1137031204', department: 'General Engineering', category: 'Mathematics', publisher: 'Palgrave Macmillan', year: 2013, edition: '7th', totalCopies: 12, availableCopies: 8, description: 'Comprehensive engineering mathematics', location: 'General Section - Shelf A1', tags: ['mathematics', 'calculus', 'differential equations'] },
    { id: '44', title: 'Engineering Physics', author: 'H.K. Malik', isbn: '978-0070146174', department: 'General Engineering', category: 'Physics', publisher: 'McGraw-Hill', year: 2010, edition: '1st', totalCopies: 10, availableCopies: 7, description: 'Physics principles for engineering applications', location: 'General Section - Shelf A2', tags: ['physics', 'mechanics', 'waves'] },
    { id: '45', title: 'Engineering Chemistry', author: 'Jain & Jain', isbn: '978-8123923154', department: 'General Engineering', category: 'Chemistry', publisher: 'Dhanpat Rai', year: 2015, edition: '16th', totalCopies: 8, availableCopies: 5, description: 'Chemistry fundamentals for engineers', location: 'General Section - Shelf B1', tags: ['chemistry', 'materials', 'polymers'] },
    { id: '46', title: 'Engineering Economics', author: 'Leland Blank', isbn: '978-0073523439', department: 'General Engineering', category: 'Economics', publisher: 'McGraw-Hill', year: 2017, edition: '8th', totalCopies: 6, availableCopies: 3, description: 'Economic analysis for engineering decisions', location: 'General Section - Shelf B2', tags: ['economics', 'finance', 'decision making'] },
    { id: '47', title: 'Engineering Ethics', author: 'Charles E. Harris', isbn: '978-1133934684', department: 'General Engineering', category: 'Ethics', publisher: 'Cengage Learning', year: 2013, edition: '5th', totalCopies: 4, availableCopies: 2, description: 'Ethical issues in engineering practice', location: 'General Section - Shelf C1', tags: ['ethics', 'professional responsibility', 'society'] },
    { id: '48', title: 'Project Management for Engineers', author: 'Nolberto Munier', isbn: '978-1439895924', department: 'General Engineering', category: 'Project Management', publisher: 'CRC Press', year: 2012, edition: '1st', totalCopies: 5, availableCopies: 1, description: 'Project management principles for engineers', location: 'General Section - Shelf C2', tags: ['project management', 'planning', 'leadership'] },
    { id: '49', title: 'Technical Communication', author: 'Mike Markel', isbn: '978-1319058678', department: 'General Engineering', category: 'Communication', publisher: 'Bedford/St. Martin\'s', year: 2017, edition: '12th', totalCopies: 7, availableCopies: 4, description: 'Technical writing and communication skills', location: 'General Section - Shelf D1', tags: ['technical writing', 'communication', 'documentation'] },
    { id: '50', title: 'Innovation and Entrepreneurship', author: 'Peter F. Drucker', isbn: '978-0060851139', department: 'General Engineering', category: 'Innovation', publisher: 'HarperBusiness', year: 2006, edition: '1st', totalCopies: 3, availableCopies: 0, description: 'Principles of innovation and entrepreneurship', location: 'General Section - Shelf D2', tags: ['innovation', 'entrepreneurship', 'business'] }
  ];

  useEffect(() => {
    // Combine all books
    const allBooks = [...mockBooks, ...additionalBooks];
    setBooks(allBooks);
    setFilteredBooks(allBooks);
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedDepartment, selectedCategory, availabilityFilter, books]);

  const filterBooks = () => {
    let filtered = books;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.includes(searchQuery) ||
        book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Department filter
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(book => book.department === selectedDepartment);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Availability filter
    if (availabilityFilter === 'Available') {
      filtered = filtered.filter(book => book.availableCopies > 0);
    } else if (availabilityFilter === 'Unavailable') {
      filtered = filtered.filter(book => book.availableCopies === 0);
    }

    setFilteredBooks(filtered);
  };

  const departments = ['All', 'Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electronics & Communication', 'General Engineering'];
  const categories = ['All', 'Algorithms', 'Software Engineering', 'Networks', 'Database', 'Operating Systems', 'Circuit Analysis', 'Electronics', 'Power Systems', 'Control Systems', 'Signal Processing', 'Mechanics', 'Thermodynamics', 'Design', 'Fluid Mechanics', 'Manufacturing', 'Structural Engineering', 'Concrete Design', 'Geotechnical', 'Transportation', 'Environmental', 'Communication', 'Microprocessors', 'Antennas', 'VLSI', 'Electromagnetics', 'Artificial Intelligence', 'Computer Graphics', 'Compilers', 'Electric Machines', 'Microelectronics', 'Renewable Energy', 'Heat Transfer', 'Materials', 'Engines', 'Steel Design', 'Water Resources', 'Construction', 'Digital Communication', 'Radar', 'Optical Communication', 'Mathematics', 'Physics', 'Chemistry', 'Economics', 'Ethics', 'Project Management', 'Innovation'];

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    transition: 'background 0.3s ease'
  };

  const headerStyle: React.CSSProperties = {
    background: isDarkMode
      ? 'rgba(30, 30, 60, 0.95)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onBack}
            style={{
              background: isDarkMode ? '#4f46e5' : '#6366f1',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#3730a3' : '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode ? '#4f46e5' : '#6366f1';
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ 
            margin: 0, 
            color: isDarkMode ? '#fff' : '#333',
            transition: 'color 0.3s ease'
          }}>
            📚 Library Services
          </h1>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🚪 Logout
        </button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Search and Filters */}
        <div style={{
          background: isDarkMode 
            ? 'rgba(40, 40, 60, 0.95)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          transition: 'background 0.3s ease'
        }}>
          <h2 style={{ 
            margin: '0 0 1.5rem 0', 
            color: isDarkMode ? '#fff' : '#333',
            transition: 'color 0.3s ease'
          }}>
            Search Engineering Books
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by title, author, ISBN, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                background: isDarkMode ? 'rgba(60, 60, 80, 0.8)' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                transition: 'all 0.3s ease'
              }}
            />
            
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                background: isDarkMode ? 'rgba(60, 60, 80, 0.8)' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                transition: 'all 0.3s ease'
              }}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                background: isDarkMode ? 'rgba(60, 60, 80, 0.8)' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                transition: 'all 0.3s ease'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                background: isDarkMode ? 'rgba(60, 60, 80, 0.8)' : '#fff',
                color: isDarkMode ? '#fff' : '#333',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="All">All Books</option>
              <option value="Available">Available Only</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          
          <p style={{ 
            margin: 0, 
            color: isDarkMode ? '#ccc' : '#666',
            transition: 'color 0.3s ease'
          }}>
            Found {filteredBooks.length} books
          </p>
        </div>

        {/* Books Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => handleBookClick(book)}
              style={{
                background: isDarkMode 
                  ? 'rgba(40, 40, 60, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                border: book.availableCopies === 0 ? '2px solid #ef4444' : '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 15px 40px rgba(255, 255, 0, 0.2), 0 0 30px rgba(255, 255, 0, 0.1)' 
                  : '0 15px 40px rgba(255, 255, 0, 0.15), 0 0 25px rgba(255, 255, 0, 0.08)';
                e.currentTarget.style.background = isDarkMode 
                  ? 'rgba(50, 50, 70, 0.98)' 
                  : 'rgba(255, 255, 255, 0.98)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                e.currentTarget.style.background = isDarkMode 
                  ? 'rgba(40, 40, 60, 0.95)' 
                  : 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: isDarkMode ? '#fff' : '#333',
                  margin: 0,
                  flex: 1,
                  transition: 'color 0.3s ease'
                }}>
                  {book.title}
                </h3>
                <span style={{
                  background: book.availableCopies > 0 ? '#10b981' : '#ef4444',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginLeft: '0.5rem'
                }}>
                  {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Unavailable'}
                </span>
              </div>
              
              <p style={{
                color: isDarkMode ? '#ccc' : '#666',
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}>
                <strong>Author:</strong> {book.author}
              </p>
              
              <p style={{
                color: isDarkMode ? '#ccc' : '#666',
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}>
                <strong>Department:</strong> {book.department}
              </p>
              
              <p style={{
                color: isDarkMode ? '#ccc' : '#666',
                margin: '0 0 0.5rem 0',
                fontSize: '0.9rem',
                transition: 'color 0.3s ease'
              }}>
                <strong>Category:</strong> {book.category}
              </p>
              
              <p style={{
                color: isDarkMode ? '#ccc' : '#666',
                margin: '0 0 1rem 0',
                fontSize: '0.85rem',
                lineHeight: '1.4',
                transition: 'color 0.3s ease'
              }}>
                {book.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {book.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: isDarkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
                      color: isDarkMode ? '#a5b4fc' : '#667eea',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div style={{
            background: isDarkMode 
              ? 'rgba(40, 40, 60, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'background 0.3s ease'
          }}>
            <h3 style={{ 
              color: isDarkMode ? '#fff' : '#333',
              marginBottom: '1rem',
              transition: 'color 0.3s ease'
            }}>
              No books found
            </h3>
            <p style={{ 
              color: isDarkMode ? '#ccc' : '#666',
              transition: 'color 0.3s ease'
            }}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </main>

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: isDarkMode 
              ? 'rgba(40, 40, 60, 0.98)' 
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            transition: 'background 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ 
                margin: 0, 
                color: isDarkMode ? '#fff' : '#333',
                flex: 1,
                transition: 'color 0.3s ease'
              }}>
                {selectedBook.title}
              </h2>
              <button
                onClick={() => setShowBookDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: isDarkMode ? '#fff' : '#333',
                  marginLeft: '1rem',
                  transition: 'color 0.3s ease'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Author:</strong> {selectedBook.author}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>ISBN:</strong> {selectedBook.isbn}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Publisher:</strong> {selectedBook.publisher}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Year:</strong> {selectedBook.year}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Edition:</strong> {selectedBook.edition}
                </p>
              </div>
              <div>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Department:</strong> {selectedBook.department}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Category:</strong> {selectedBook.category}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Location:</strong> {selectedBook.location}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: isDarkMode ? '#ccc' : '#666',
                  transition: 'color 0.3s ease'
                }}>
                  <strong>Total Copies:</strong> {selectedBook.totalCopies}
                </p>
                <p style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: selectedBook.availableCopies > 0 ? '#10b981' : '#ef4444',
                  fontWeight: '600'
                }}>
                  <strong>Available:</strong> {selectedBook.availableCopies}
                </p>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: isDarkMode ? '#fff' : '#333',
                transition: 'color 0.3s ease'
              }}>
                Description
              </h3>
              <p style={{ 
                margin: 0, 
                color: isDarkMode ? '#ccc' : '#666',
                lineHeight: '1.6',
                transition: 'color 0.3s ease'
              }}>
                {selectedBook.description}
              </p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: isDarkMode ? '#fff' : '#333',
                transition: 'color 0.3s ease'
              }}>
                Tags
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedBook.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: isDarkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.1)',
                      color: isDarkMode ? '#a5b4fc' : '#667eea',
                      padding: '0.3rem 0.7rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                disabled={selectedBook.availableCopies === 0}
                style={{
                  background: selectedBook.availableCopies > 0 ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: selectedBook.availableCopies > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600',
                  flex: 1
                }}
              >
                {selectedBook.availableCopies > 0 ? '📚 Reserve Book' : '❌ Unavailable'}
              </button>
              <button
                onClick={() => setShowBookDetails(false)}
                style={{
                  background: 'transparent',
                  color: isDarkMode ? '#fff' : '#333',
                  border: `2px solid ${isDarkMode ? '#fff' : '#333'}`,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLibrary;

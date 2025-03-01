 {">
  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = localStorage.getItem('calendar-events');
      const savedDiaryEntries = localStorage.getItem('diary-entries');
      const savedNotes = localStorage.getItem('quick-notes');
      const savedGoals = localStorage.getItem('user-goals');
      const savedMedical = localStorage.getItem('medical-records');
      
      let allEvents: Event[] = [];
      
      if (savedEvents) {
        allEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      }
      
      if (savedDiaryEntries) {
        const diaryEvents = JSON.parse(savedDiaryEntries).map((entry: any) => ({
          id: `diary-${entry.id}`,
          title: "Diary Entry",
          description: entry.content,
          date: new Date(entry.date),
          category: 'diary' as const,
          tags: [`mood-${entry.mood}`, `energy-${entry.energy}`]
        }));
        allEvents = [...allEvents, ...diaryEvents];
      }
      
      if (savedNotes) {
        const noteEvents = JSON.parse(savedNotes).map((note: any) => ({
          id: `note-${note.id}`,
          title: note.title,
          description: note.content,
          date: new Date(note.date),
          category: 'note' as const
        }));
        allEvents = [...allEvents, ...noteEvents];
      }
      
      if (savedGoals) {
        const goalEvents = JSON.parse(savedGoals).map((goal: any) => ({
          id: `goal-${goal.id}`,
          title: goal.title,
          description: goal.description,
          date: new Date(goal.dueDate || goal.createdAt),
          category: 'goal' as const,
          tags: [`priority-${goal.priority}`, `status-${goal.status}`]
        }));
        allEvents = [...allEvents, ...goalEvents];
      }
      
      if (savedMedical) {
        const medicalEvents = JSON.parse(savedMedical).map((record: any) => ({
          id: `medical-${record.id}`,
          title: record.title || "Medical Appointment",
          description: record.notes || record.prescription,
          date: new Date(record.appointmentDate || record.date),
          category: 'medical' as const,
          tags: [record.type || "appointment", record.status || "scheduled"]
        }));
        allEvents = [...allEvents, ...medicalEvents];
      }
      
      setEvents(allEvents);
    };

    loadEvents();
    
    const savedStickers = localStorage.getItem('calendar-stickers');
    if (savedStickers) {
      setStickers(JSON.parse(savedStickers).map((sticker: any) => ({
        ...sticker,
        date: new Date(sticker.date)
      })));
    }
  }, []);

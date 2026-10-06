import { SearchResults } from './LibraryView.jsx';

export default function CategoryView({
  category,
  query,
  results,
  onQueryChange,
  onOpenLesson,
  onBack,
  searchRef,
}) {
  const topicGroups = category.topics.reduce((groups, topic) => {
    const label = topic.group || 'Core concepts';
    const group = groups.find((entry) => entry.label === label);
    if (group) {
      group.topics.push(topic);
    } else {
      groups.push({ label, topics: [topic] });
    }
    return groups;
  }, []);
  const lessonNumberById = new Map(
    topicGroups.flatMap((group) => group.topics).map((topic, index) => [topic.id, index + 1]),
  );

  return (
    <main className="category-view">
      <button className="text-back" type="button" onClick={onBack}>← All categories</button>
      <header className="category-hero">
        <p className="eyebrow">Curriculum category</p>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
      </header>

      <label className="library-search category-search">
        <span className="sr-only">Search lessons</span>
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={`Search ${category.title} or the whole library`}
        />
        <kbd>/</kbd>
      </label>

      {query.trim() ? (
        <SearchResults query={query} results={results} onOpenLesson={onOpenLesson} />
      ) : (
        <section aria-labelledby="category-lessons-title">
          <div className="index-heading">
            <h2 id="category-lessons-title">Lessons in learning order</h2>
            <span>{category.topics.length} lessons</span>
          </div>
          <div className="subcategory-list">
            {topicGroups.map((group) => (
              <section className="subcategory-section" key={group.label}>
                <header className="subcategory-heading">
                  <h3>{group.label}</h3>
                  <span>{group.topics.length} {group.topics.length === 1 ? 'lesson' : 'lessons'}</span>
                </header>
                <div className="lesson-index">
                  {group.topics.map((topic) => (
                    <button type="button" key={topic.id} onClick={() => onOpenLesson(topic.id)}>
                      <span className="lesson-order">
                        {String(lessonNumberById.get(topic.id)).padStart(2, '0')}
                      </span>
                      <span className="lesson-index-copy">
                        <strong>{topic.title}</strong>
                        <span>{topic.keywords.slice(0, 4).join(', ')}</span>
                      </span>
                      <span className="lesson-depth">{topic.level}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

/* eslint-disable */
const checkboxes = document.querySelectorAll("input[type='checkbox']");
const saveButton = document.querySelector('button[type="submit"]');

let changes = [];

const handleChange = (e) => {
  const { id, field } = e.target.dataset;

  if (!changes.find((c) => c.id === id && c.field === field)) {
    changes.push({ id, field, value: e.target.checked });
  } else {
    changes = changes.filter((c) => c.id !== id || c.field !== field);
  }
};

checkboxes.forEach((c) => c.addEventListener('change', handleChange));

saveButton.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changes }),
    });

    if (response.ok) {
      window.location.href = '/';
    }
  } catch (err) {
    console.error(err);
  }
});

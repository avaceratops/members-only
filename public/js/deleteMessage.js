/* eslint-disable */
const deleteBtns = document.querySelectorAll('button.delete-btn');

const handleClick = async (e) => {
  const { id } = e.target.dataset;

  console.log(id);

  try {
    const response = await fetch('/delete-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      window.location.href = '/';
    }
  } catch (err) {
    console.error(err);
  }
};

deleteBtns.forEach((btn) => btn.addEventListener('click', handleClick));

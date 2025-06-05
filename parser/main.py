import re

def clean_name_for_hotline_search(name):
    """
    Видаляє бренди (Intel, AMD), "Core", "Ryzen", "Pentium", "Gold", тощо,
    залишає лише ключові частини для пошуку на Hotline.
    """
    name = name.lower()

    # Видаляємо зайві слова
    keywords_to_remove = ['intel', 'amd', 'core', 'ryzen', 'pentium', 'gold', 'processor', 'cpu']
    for word in keywords_to_remove:
        name = name.replace(word, '')

    # Залишаємо тільки літери, цифри, тире
    cleaned = re.sub(r'[^a-zA-Z0-9\- ]+', '', name)

    # Прибираємо зайві пробіли і скорочуємо до моделі
    cleaned = ' '.join(cleaned.split())
    return cleaned

# Демонстрація
component_names = [
    "Intel Core i7-13700K",
    "AMD Ryzen 7 7800X3D",
    "Intel Core i3-10100F",
    "AMD Ryzen 5 5600X",
    "Intel Pentium Gold G7400",
]

search_links = {
    name: f"https://hotline.ua/search/?q={clean_name_for_hotline_search(name).replace(' ', '+')}"
    for name in component_names
}

import pandas as pd
#import ace_tools as tools; tools.display_dataframe_to_user("Покращені посилання для пошуку на Hotline", pd.DataFrame.from_dict(search_links, orient='index', columns=["Hotline URL"]))

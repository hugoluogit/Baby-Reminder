import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getArticlesByCategory, searchArticles } from '../data/articles';
import AdBanner from '../components/AdBanner';

const categories = ['全部', '新生兒護理', '餵養指導', '睡眠指導', '疾病預防'];

function ArticleContent({ content }) {
  const lines = React.useMemo(() => {
    return content.split('\n').filter(Boolean);
  }, [content]);

  return (
    <View style={styles.articleBody}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <Text key={i} style={styles.articleH2}>{line.replace('## ', '')}</Text>;
        }
        if (line.startsWith('### ')) {
          return <Text key={i} style={styles.articleH3}>{line.replace('### ', '')}</Text>;
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <View key={i} style={styles.articleListItem}>
              <Text style={styles.articleListBullet}>{'\u2022'}</Text>
              <Text style={styles.articleListText}>{line.replace(/^\d+\.\s/, '')}</Text>
            </View>
          );
        }
        if (/^[-*]\s/.test(line)) {
          return (
            <View key={i} style={styles.articleListItem}>
              <Text style={styles.articleListBullet}>{'\u2022'}</Text>
              <Text style={styles.articleListText}>{line.replace(/^[-*]\s/, '')}</Text>
            </View>
          );
        }
        return <Text key={i} style={styles.articleBodyText}>{line}</Text>;
      })}
    </View>
  );
}

export default function KnowledgeScreen() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState(getArticlesByCategory('全部'));
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  function handleCategoryPress(category) {
    setActiveCategory(category);
    setArticles(getArticlesByCategory(category));
  }

  function handleSearch(text) {
    setQuery(text);
    if (text.trim()) {
      setArticles(searchArticles(text));
    } else {
      setArticles(getArticlesByCategory(activeCategory));
    }
  }

  function handleArticlePress(article) {
    setSelectedArticle(article);
    setModalVisible(true);
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="搜尋文章..."
            placeholderTextColor="#999"
          />
          {query ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
              onPress={() => handleCategoryPress(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {articles.map((article, index) => (
          <React.Fragment key={article.id}>
            <TouchableOpacity style={styles.articleCard} onPress={() => handleArticlePress(article)}>
              <View style={styles.articleIcon}>
                <Text style={styles.articleIconText}>{article.icon}</Text>
              </View>
              <View style={styles.articleInfo}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <Text style={styles.articleSummary}>{article.summary}</Text>
                <Text style={styles.articleCategory}>{article.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
            {/* 原生廣告：在文章列表中間顯示（第2篇和第5篇之後） */}
            {(index === 2 || index === 4) && (
              <View style={styles.nativeAd}>
                <Ionicons name="megaphone-outline" size={16} color="#999" />
                <Text style={styles.nativeAdText}>廣告位</Text>
              </View>
            )}
          </React.Fragment>
        ))}
      </ScrollView>

      <AdBanner />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedArticle?.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.articleBody}>
              {selectedArticle?.icon && (
                <Text style={styles.articleBodyIcon}>{selectedArticle.icon}</Text>
              )}
              <ArticleContent content={selectedArticle?.content || ''} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333', marginLeft: 8 },
  categoryRow: { marginBottom: 16 },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryBtnActive: { backgroundColor: '#FF6B8A', borderColor: '#FF6B8A' },
  categoryText: { fontSize: 14, color: '#666' },
  categoryTextActive: { color: '#FFF', fontWeight: '600' },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  articleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  articleIconText: { fontSize: 24 },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  articleSummary: { fontSize: 13, color: '#888', marginTop: 4, lineHeight: 18 },
  articleCategory: { fontSize: 12, color: '#FF6B8A', marginTop: 6 },
  nativeAd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  nativeAdText: { fontSize: 12, color: '#999', marginLeft: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 12 },
  articleBody: { flex: 1, paddingBottom: 20 },
  articleBodyIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
  articleH2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B8A',
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF0F3',
  },
  articleH3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  articleBodyText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 26,
    marginBottom: 6,
  },
  articleListItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  articleListBullet: {
    fontSize: 15,
    color: '#FF6B8A',
    lineHeight: 26,
    marginRight: 8,
  },
  articleListText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 26,
    flex: 1,
  },
});
